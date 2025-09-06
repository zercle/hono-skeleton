import 'reflect-metadata'; // Must be first import for tsyringe
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { container } from 'tsyringe';
import {
  ConfigToken,
  LoggerToken,
  UserRepositoryToken,
  RegisterUserUseCaseToken,
  LoginUserUseCaseToken,
} from '@zercle/shared/container/tokens';
import { ConfigService } from './infrastructure/config/config.service';
import { UserRepositoryImpl } from './infrastructure/repositories/user-repository-impl';
import { RegisterUserUseCase } from './domains/auth/usecases/register-user';
import { LoginUserUseCase } from './domains/auth/usecases/login-user';
import { registerAuthRoutes } from './domains/auth/routes';

// Register core services
container.registerSingleton(ConfigToken, ConfigService);
container.registerSingleton(UserRepositoryToken, UserRepositoryImpl);
container.registerSingleton(RegisterUserUseCaseToken, RegisterUserUseCase);
container.registerSingleton(LoginUserUseCaseToken, LoginUserUseCase);

// Create the Hono app
const app = new OpenAPIHono();

// Middleware
app.use(cors());

// Register routes
registerAuthRoutes(app);

// OpenAPI Docs
app.doc('/docs/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Hono Clean Architecture API',
  },
});

app.get('/docs', swaggerUI({ url: '/docs/openapi.json' }));

export default app;
export type AppType = typeof app;
