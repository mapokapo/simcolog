import chalk from "chalk";

/**
 * A utility type which is a string that represents a log severity (in order of severity: "trace" < "debug" < "info" < "warn" < "error" < "fatal").
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Logger severity levels.
 */
const levels: LogLevel[] = ["trace", "debug", "info", "warn", "error", "fatal"];

/**
 * A utility type which represents a function that logs a message.
 */
export type LoggerFunction = (message: string, ...rest: string[]) => void;

/**
 * A utility type which maps log severity levels to functions which should log messages at that severity.
 */
export type LoggerFunctions = {
  [level in LogLevel]: LoggerFunction;
};

/**
 * The main logger type.
 */
export type Logger = LoggerFunctions & {
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
  level: LogLevel;

  /**
   * The prefix to add to each log message. Can be a string or a function which takes the log level and returns a string.
   */
  prefix: string | ((level: LogLevel) => string);

  /**
   * Whether to include a timestamp in each log message.
   */
  includeTimestamp: boolean;

  /**
   * Whether to log to stderr instead of stdout.
   */
  stderr: boolean;

  /**
   * A callback to call when a message is successfully logged. This can be used to store the logs to a file or other destination.
   * @param message The message that was logged.
   * @returns void
   */
  logCallback: (message: string) => void;
}

/**
 * Sensible default logger options.
 */
const defaultOptions: LoggerOptions = {
  level: "info",
  prefix: "",
  includeTimestamp: true,
  stderr: false,
  logCallback: () => {},
};

/**
 * Create a new logger with the given options.
 * @param opts The options to create the logger with.
 * @returns A new logger.
 */
export const createLogger: (opts: Partial<LoggerOptions>) => Logger = opts => {
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

  const shouldLog = (level: LogLevel) => {
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

      const formattedMessage = `${timestamp + prefix} ${(message + rest.join(" ")).trim()}`;

      if (stream === null) {
        console.log(formattedMessage);
      } else {
        stream.write(formattedMessage);

        if (!message.endsWith("\n")) {
          stream.write("\n");
        }
      }

      options.logCallback(formattedMessage);
    };
  }

  return logger;
};

/**
 * Modify an existing logger with new options. Note: you can also use the `modify` method on the logger itself, which will return a new logger with the new options.
 * @param logger The logger to modify.
 * @param opts The new options to apply to the logger.
 * @returns A new logger with the new options.
 */
export const modifyLogger = (
  logger: Logger,
  opts: Partial<LoggerOptions>
): Logger => {
  return createLogger({ ...logger.options, ...opts });
};

export const defaultLogger: Logger = createLogger({
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
