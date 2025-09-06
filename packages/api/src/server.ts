import 'reflect-metadata';
import { container } from 'tsyringe';
import app from './app';
import { ConfigToken } from '@zercle/shared/container/tokens';
import { IConfigService } from './infrastructure/config/config.interface';

const configService = container.resolve<IConfigService>(ConfigToken);
const port = configService.get<number>('server.port');

console.log(`Server running on port ${port}`);

Bun.serve({
  fetch: app.fetch,
  port,
});
