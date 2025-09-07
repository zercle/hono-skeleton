import 'reflect-metadata';
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { DependencyContainer } from 'tsyringe';
import { z } from 'zod';
import {
  CreatePostInputSchema,
  UpdatePostInputSchema,
  PostResponseSchema,
  PostQuerySchema,
} from './models/schemas';
import { createPostsHandler } from './handlers/posts-handler';

export function registerPostsRoutes(app: OpenAPIHono, diContainer: DependencyContainer) {
  const postsHandler = createPostsHandler(diContainer);

  // Create Post Route
  const createPostRoute = createRoute({
    method: 'post',
    path: '/posts',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreatePostInputSchema,
            example: {
              title: 'My First Post',
              content: 'This is the content of my first post...',
              excerpt: 'A brief excerpt of the post',
              published: false,
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Post created successfully',
        content: {
          'application/json': {
            schema: PostResponseSchema,
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
    summary: 'Create a new post',
    description: 'Creates a new blog post with title, content, and optional excerpt.',
  });

  // Get Post Route
  const getPostRoute = createRoute({
    method: 'get',
    path: '/posts/{id}',
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: '01234567-89ab-cdef-0123-456789abcdef' }),
      }),
    },
    responses: {
      200: {
        description: 'Post retrieved successfully',
        content: {
          'application/json': {
            schema: PostResponseSchema,
          },
        },
      },
      404: {
        description: 'Post not found',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
    summary: 'Get a post by ID',
    description: 'Retrieves a single post by its unique identifier.',
  });

  // List Posts Route
  const listPostsRoute = createRoute({
    method: 'get',
    path: '/posts',
    request: {
      query: z.object({
        page: z.string().optional().openapi({ example: '1' }),
        limit: z.string().optional().openapi({ example: '10' }),
        published: z.string().optional().openapi({ example: 'true' }),
        authorId: z.string().uuid().optional().openapi({ example: '01234567-89ab-cdef-0123-456789abcdef' }),
      }),
    },
    responses: {
      200: {
        description: 'Posts retrieved successfully',
        content: {
          'application/json': {
            schema: z.object({
              posts: z.array(PostResponseSchema),
              total: z.number(),
              page: z.number(),
              limit: z.number(),
              totalPages: z.number(),
            }),
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
    summary: 'List posts with pagination',
    description: 'Retrieves a paginated list of posts with optional filtering.',
  });

  // Update Post Route
  const updatePostRoute = createRoute({
    method: 'put',
    path: '/posts/{id}',
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: '01234567-89ab-cdef-0123-456789abcdef' }),
      }),
      body: {
        content: {
          'application/json': {
            schema: UpdatePostInputSchema,
            example: {
              title: 'Updated Post Title',
              content: 'Updated content...',
              published: true,
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Post updated successfully',
        content: {
          'application/json': {
            schema: PostResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad Request',
      },
      403: {
        description: 'Forbidden - Not authorized to update this post',
      },
      404: {
        description: 'Post not found',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
    summary: 'Update a post',
    description: 'Updates an existing post. Only the author can update their posts.',
  });

  // Delete Post Route
  const deletePostRoute = createRoute({
    method: 'delete',
    path: '/posts/{id}',
    request: {
      params: z.object({
        id: z.string().uuid().openapi({ example: '01234567-89ab-cdef-0123-456789abcdef' }),
      }),
    },
    responses: {
      200: {
        description: 'Post deleted successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
      },
      403: {
        description: 'Forbidden - Not authorized to delete this post',
      },
      404: {
        description: 'Post not found',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
    summary: 'Delete a post',
    description: 'Deletes an existing post. Only the author can delete their posts.',
  });

  // Register all post routes
  app.openapi(createPostRoute, postsHandler.handleCreatePost);
  app.openapi(getPostRoute, postsHandler.handleGetPost);
  app.openapi(listPostsRoute, postsHandler.handleListPosts);
  app.openapi(updatePostRoute, postsHandler.handleUpdatePost);
  app.openapi(deletePostRoute, postsHandler.handleDeletePost);
}