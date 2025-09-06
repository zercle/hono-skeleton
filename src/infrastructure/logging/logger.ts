import pino from 'pino';
import { configService } from '@/infrastructure/config/env';
import type { Logger } from '@/shared/types/common';

const logLevel = configService.get('LOG_LEVEL');
const prettyPrint = configService.get('LOG_PRETTY');

const pinoLogger = pino({
  level: logLevel,
  ...(prettyPrint && configService.isDevelopment() && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
  ...(!prettyPrint && {
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
});

export class LoggerService implements Logger {
  private logger: pino.Logger;

  constructor(context?: string) {
    this.logger = context ? pinoLogger.child({ context }) : pinoLogger;
  }

  info(message: string, meta?: any): void {
    this.logger.info(meta, message);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(meta, message);
  }

  error(message: string, error?: Error, meta?: any): void {
    this.logger.error(
      {
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : undefined,
        ...meta,
      },
      message
    );
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(meta, message);
  }

  child(context: string): LoggerService {
    return new LoggerService(context);
  }

  // Pino-specific methods for HTTP request logging
  requestLogger() {
    return this.logger;
  }
}

export const logger = new LoggerService('App');
export const createLogger = (context: string) => new LoggerService(context);