import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
// Auth handler will be resolved lazily
let authHandler: any;
import { authMiddleware } from '@/infrastructure/middleware/auth';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  ChangePasswordRequestSchema,
  UserProfileSchema,
  AuthenticatedUserSchema,
  UserListResponseSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
  FailResponseSchema,
} from '../models/auth';

// Helper function to get auth handler (lazy initialization)
async function getAuthHandler() {
  if (!authHandler) {
    const { Container } = await import('@/shared/container/container');
    const { TOKENS } = await import('@/shared/container/tokens');
    const { AuthHandler } = await import('../handlers/AuthHandler');
    const { DrizzleUserRepository } = await import('../repositories/DrizzleUserRepository');
    const { CreateUserUseCase } = await import('../usecases/CreateUserUseCase');
    const { AuthenticateUserUseCase } = await import('../usecases/AuthenticateUserUseCase');
    const { GetUserUseCase } = await import('../usecases/GetUserUseCase');
    const { GetUsersUseCase } = await import('../usecases/GetUsersUseCase');
    const { ChangePasswordUseCase } = await import('../usecases/ChangePasswordUseCase');

    // Register services
    const container = Container.getInstance();
    container.registerSingleton(TOKENS.UserRepository, DrizzleUserRepository);
    container.registerSingleton(TOKENS.CreateUserUseCase, CreateUserUseCase);
    container.registerSingleton(TOKENS.AuthenticateUserUseCase, AuthenticateUserUseCase);
    container.registerSingleton(TOKENS.GetUserUseCase, GetUserUseCase);
    container.registerSingleton(TOKENS.GetUsersUseCase, GetUsersUseCase);
    container.registerSingleton(TOKENS.ChangePasswordUseCase, ChangePasswordUseCase);
    container.registerSingleton(TOKENS.AuthHandler, AuthHandler);

    authHandler = container.resolve<AuthHandler>(TOKENS.AuthHandler);
  }
  return authHandler;
}

const authRoutes = new OpenAPIHono();

// Register endpoint
const registerRoute = createRoute({
  method: 'post',
  path: '/auth/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            user: UserProfileSchema,
          })),
        },
      },
      description: 'User registered successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: FailResponseSchema,
        },
      },
      description: 'Validation error',
    },
    409: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'User already exists',
    },
  },
  tags: ['Authentication'],
  summary: 'Register a new user',
  description: 'Create a new user account with email and password',
});

// Login endpoint
const loginRoute = createRoute({
  method: 'post',
  path: '/auth/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: LoginRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            user: AuthenticatedUserSchema,
          })),
        },
      },
      description: 'User authenticated successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: FailResponseSchema,
        },
      },
      description: 'Validation error',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Invalid credentials',
    },
  },
  tags: ['Authentication'],
  summary: 'Authenticate user',
  description: 'Login with email and password to get access tokens',
});

// Get profile endpoint
const getProfileRoute = createRoute({
  method: 'get',
  path: '/auth/profile',
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            user: UserProfileSchema,
          })),
        },
      },
      description: 'User profile retrieved successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'User not found',
    },
  },
  tags: ['Authentication'],
  summary: 'Get current user profile',
  description: 'Get the profile of the authenticated user',
});

// Change password endpoint
const changePasswordRoute = createRoute({
  method: 'post',
  path: '/auth/change-password',
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: ChangePasswordRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            success: z.boolean(),
          })),
        },
      },
      description: 'Password changed successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: FailResponseSchema,
        },
      },
      description: 'Validation error',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized or invalid current password',
    },
  },
  tags: ['Authentication'],
  summary: 'Change user password',
  description: 'Change the password for the authenticated user',
});

// Get users endpoint (admin)
const getUsersRoute = createRoute({
  method: 'get',
  path: '/auth/users',
  security: [{ Bearer: [] }],
  request: {
    query: z.object({
      page: z.string().optional().default('1'),
      limit: z.string().optional().default('10'),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            users: UserListResponseSchema,
          })),
        },
      },
      description: 'Users retrieved successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized',
    },
  },
  tags: ['Users'],
  summary: 'Get all users',
  description: 'Get a paginated list of all users (admin endpoint)',
});

// Get single user endpoint
const getUserRoute = createRoute({
  method: 'get',
  path: '/auth/users/{id}',
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            user: UserProfileSchema,
          })),
        },
      },
      description: 'User retrieved successfully',
    },
    401: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Unauthorized',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'User not found',
    },
  },
  tags: ['Users'],
  summary: 'Get user by ID',
  description: 'Get a specific user by their ID',
});

// Health check endpoint
const healthRoute = createRoute({
  method: 'get',
  path: '/auth/health',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SuccessResponseSchema(z.object({
            service: z.string(),
            status: z.string(),
            timestamp: z.string(),
          })),
        },
      },
      description: 'Auth service health status',
    },
  },
  tags: ['Health'],
  summary: 'Auth service health check',
  description: 'Check the health status of the authentication service',
});

// Route implementations
authRoutes.openapi(registerRoute, async (c) => {
  const handler = await getAuthHandler();
  return handler.register(c);
});

authRoutes.openapi(loginRoute, async (c) => {
  const handler = await getAuthHandler();
  return handler.login(c);
});

authRoutes.openapi(getProfileRoute, authMiddleware, async (c) => {
  const handler = await getAuthHandler();
  return handler.getProfile(c);
});

authRoutes.openapi(changePasswordRoute, authMiddleware, async (c) => {
  const handler = await getAuthHandler();
  return handler.changePassword(c);
});

authRoutes.openapi(getUsersRoute, authMiddleware, async (c) => {
  const handler = await getAuthHandler();
  return handler.getUsers(c);
});

authRoutes.openapi(getUserRoute, authMiddleware, async (c) => {
  const handler = await getAuthHandler();
  return handler.getUser(c);
});

authRoutes.openapi(healthRoute, async (c) => {
  const handler = await getAuthHandler();
  return handler.health(c);
});

export { authRoutes };

// Import z for the route definitions
import { z } from 'zod';