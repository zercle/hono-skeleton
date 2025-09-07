import 'reflect-metadata'; // Ensure reflect-metadata is loaded
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { DependencyContainer } from 'tsyringe';
import { Context } from 'hono'; // Import Context
import {
  RegisterUserUseCaseToken,
  LoginUserUseCaseToken,
  UserRepositoryToken,
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
import { jwtMiddleware } from '../../middleware/jwt'; // Import the new JWT middleware
import { IUserRepository } from './repositories/user-repository';

export function registerAuthRoutes(app: OpenAPIHono, diContainer: DependencyContainer) {
  const authHandler = createAuthHandler(diContainer); // Pass diContainer to authHandler

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

  // New route for /me, protected by jwtMiddleware
  const meRoute = createRoute({
    method: 'get',
    path: '/me',
    responses: {
      200: {
        description: 'Current user profile',
        content: {
          'application/json': {
            schema: UserResponseSchema, // Reuse existing user schema
          },
        },
      },
      401: {
        description: 'Unauthorized',
      },
    },
    summary: 'Get current user profile',
    description: 'Retrieves the profile of the authenticated user.',
  });

  app.openapi(meRoute, jwtMiddleware(diContainer), async (c: Context): Promise<z.infer<typeof UserResponseSchema> | Response> => {
    // Access the decoded user from the context, set by jwtMiddleware
    const { id: userIdFromToken } = c.get('user');

    // Resolve UserRepository via DI
    const userRepository = diContainer.resolve<IUserRepository>(UserRepositoryToken);

    // Fetch user data from DB using the ID from the token
    const user = await userRepository.findById(userIdFromToken);

    if (!user) {
      // This case should ideally not happen if token is valid and user exists
      // Throw an error, error middleware will handle the response
      throw new Error('User not found');
    }

    // Return minimal user profile
    // The openapi handler expects the raw data, not a Hono Response
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });
}
