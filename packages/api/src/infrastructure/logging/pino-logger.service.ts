import { injectable, inject } from 'tsyringe';
import pino, { Logger as PinoLogger, LevelWithSilent } from 'pino';
import { ILogger } from './logger.interface';
import { IConfigService } from '../config/config.interface';
import { ConfigToken } from '@zercle/shared/container/tokens';

@injectable()
export class PinoLoggerService implements ILogger {
  private logger: PinoLogger;

  constructor(@inject(ConfigToken) private configService: IConfigService) {
    const logLevel = this.configService.get<string>(
      'logging.level'
    ) as LevelWithSilent;
    this.logger = pino({
      level: logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  info(message: string, context?: Record<string, any>): void {
    this.logger.info(context, message);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(context, message);
  }

  error(message: string, context?: Record<string, any>): void {
    this.logger.error(context, message);
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(context, message);
  }
}
