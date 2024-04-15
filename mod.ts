import chalk from "chalk";

export type LevelString =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";
const levels: LevelString[] = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
];

export type LoggerLevels = {
  [level in LevelString]: (message: string, ...rest: string[]) => void;
};

export type Logger = LoggerLevels & {
  modify: (opts: Partial<LoggerOptions>) => Logger;
  readonly options: LoggerOptions;
};

interface LoggerOptions {
  level: LevelString;
  prefix: string | ((level: LevelString) => string);
  includeTimestamp: boolean;
  stderr: boolean;
}

const defaultOptions: LoggerOptions = {
  level: "info",
  prefix: "",
  includeTimestamp: true,
  stderr: false,
};

const createLogger: (opts: Partial<LoggerOptions>) => Logger = opts => {
  const options = {
    ...defaultOptions,
    ...opts,
  };
  const stream = options.stderr ? process.stderr : process.stdout;
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

      stream.write(
        `${timestamp + prefix} ${(message + rest.join(" ")).trim()}`
      );

      if (!message.endsWith("\n")) {
        stream.write("\n");
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
