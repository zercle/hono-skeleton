export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export class Logger {
  private static getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toLowerCase() || 'info';
    switch (level) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  private static shouldLog(level: LogLevel): boolean {
    const currentLevel = Logger.getLogLevel();
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(currentLevel);
  }

  private static log(level: LogLevel, message: string, context?: any) {
    if (!Logger.shouldLog(level)) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      context: context || undefined,
    };

    console.log(JSON.stringify(logEntry));
  }

  public static debug(message: string, context?: any) {
    Logger.log(LogLevel.DEBUG, message, context);
  }

  public static info(message: string, context?: any) {
    Logger.log(LogLevel.INFO, message, context);
  }

  public static warn(message: string, context?: any) {
    Logger.log(LogLevel.WARN, message, context);
  }

  public static error(message: string, error?: Error, context?: any) {
    Logger.log(LogLevel.ERROR, message, { error: error?.message, stack: error?.stack, ...context });
  }
}