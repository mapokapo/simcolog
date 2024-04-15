import chalk from "chalk";

/**
 * A utility type which is a string that represents a log severity (in order of severity: "trace" < "debug" < "info" < "warn" < "error" < "fatal").
 */
export type LevelString =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

/**
 * Logger severity levels.
 */
const levels: LevelString[] = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
];

/**
 * A utility type which represents a function that logs a message.
 */
export type LoggerFunction = (message: string, ...rest: string[]) => void;

/**
 * A utility type which maps log severity levels to functions which should log messages at that severity.
 */
export type LoggerLevels = {
  [level in LevelString]: LoggerFunction;
};

/**
 * The main logger type.
 */
export type Logger = LoggerLevels & {
  /**
   * Modify the logger with new options.
   * @param opts The new options to apply to the logger.
   * @returns A new logger with the new options.
   */
  modify: (opts: Partial<LoggerOptions>) => Logger;

  /**
   * The current logger options.
   */
  options: LoggerOptions;
};

/**
 * Logger options.
 */
interface LoggerOptions {
  /**
   * The current log level. Acts as a filter for which messages should be logged.
   */
  level: LevelString;

  /**
   * The prefix to add to each log message. Can be a string or a function which takes the log level and returns a string.
   */
  prefix: string | ((level: LevelString) => string);

  /**
   * Whether to include a timestamp in each log message.
   */
  includeTimestamp: boolean;

  /**
   * Whether to log to stderr instead of stdout.
   */
  stderr: boolean;
}

/**
 * Sensible default logger options.
 */
const defaultOptions: LoggerOptions = {
  level: "info",
  prefix: "",
  includeTimestamp: true,
  stderr: false,
};

/**
 * Create a new logger with the given options.
 * @param opts The options to create the logger with.
 * @returns A new logger.
 */
const createLogger: (opts: Partial<LoggerOptions>) => Logger = opts => {
  const options = {
    ...defaultOptions,
    ...opts,
  };
  const stream =
    typeof "process" === "object"
      ? options.stderr
        ? process.stderr
        : process.stdout
      : null;

  const logger = {
    options,
    modify: (opts: Partial<LoggerOptions>) => modifyLogger(logger, opts),
  } as Logger;

  const shouldLog = (level: LevelString) => {
    return levels.indexOf(level) >= levels.indexOf(options.level);
  };

  for (const level of levels) {
    logger[level] = (message: string, ...rest: string[]) => {
      if (!shouldLog(level)) {
        return;
      }

      const prefix =
        typeof options.prefix === "function"
          ? options.prefix(level)
          : options.prefix ?? "";

      const date = new Date();
      const timestamp = options.includeTimestamp
        ? `[${date.getHours().toString().padStart(2, "0")}:${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${date
            .getSeconds()
            .toString()
            .padStart(2, "0")}.${(date.getMilliseconds() / 1000)
            .toFixed(3)
            .slice(2, 5)}] `
        : "";

      if (stream === null) {
        console.log(
          `${timestamp + prefix} ${(message + rest.join(" ")).trim()}`
        );
      } else {
        stream.write(
          `${timestamp + prefix} ${(message + rest.join(" ")).trim()}`
        );

        if (!message.endsWith("\n")) {
          stream.write("\n");
        }
      }
    };
  }

  return logger;
};

const modifyLogger = (logger: Logger, opts: Partial<LoggerOptions>): Logger => {
  return createLogger({ ...logger.options, ...opts });
};

const defaultLogger: Logger = createLogger({
  level: "debug",
  prefix: level => {
    let color: keyof typeof chalk;
    switch (level) {
      case "trace":
        color = "gray";
        break;
      case "debug":
        color = "blue";
        break;
      case "info":
        color = "green";
        break;
      case "warn":
        color = "yellow";
        break;
      case "error":
        color = "red";
        break;
      case "fatal":
        color = "red";
        break;
      default:
        color = "white";
    }

    return `[${chalk[color](level)}]`;
  },
});

export { defaultLogger, createLogger };
