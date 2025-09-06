import { OpenAPIHono, createRoute, zValidator } from '@hono/zod-openapi';
import { container } from 'tsyringe';
import {
  RegisterUserUseCaseToken,
  LoginUserUseCaseToken,
} from '@zercle/shared/container/tokens';
import { z } from 'zod';
import { RegisterUserUseCase } from './usecases/register-user';
import { LoginUserUseCase } from './usecases/login-user';
import {
  RegisterUserInputSchema,
  LoginUserInputSchema,
  UserResponseSchema,
} from './models/schemas';
import { createAuthHandler } from './handlers/auth-handler';

export function registerAuthRoutes(app: OpenAPIHono) {
  const registerUserUseCase = container.resolve<RegisterUserUseCase>(
    RegisterUserUseCaseToken
  );
  const loginUserUseCase = container.resolve<LoginUserUseCase>(
    LoginUserUseCaseToken
  );

  const authHandler = createAuthHandler({
    registerUserUseCase,
    loginUserUseCase,
  });

  const registerRoute = createRoute({
    method: 'post',
    path: '/register',
    request: {
      body: {
        content: {
          'application/json': {
            schema: RegisterUserInputSchema,
            example: {
              email: 'test@example.com',
              password: 'password123',
              name: 'Test User',
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: UserResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad Request',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
    summary: 'Register a new user',
    description:
      'Registers a new user with email, password, and optional name.',
  });

  const loginRoute = createRoute({
    method: 'post',
    path: '/login',
    request: {
      body: {
        content: {
          'application/json': {
            schema: LoginUserInputSchema,
            example: {
              email: 'test@example.com',
              password: 'password123',
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User logged in successfully',
        content: {
          'application/json': {
            schema: z.object({
              token: z.string(),
            }),
          },
        },
      },
      401: {
        description: 'Unauthorized',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
    summary: 'Login a user',
    description: 'Logs in a user with email and password, returning a JWT.',
  });

  app.openapi(registerRoute, authHandler.handleRegister);
  app.openapi(loginRoute, authHandler.handleLogin);
}
