import { Context } from 'hono';
import { DependencyContainer } from 'tsyringe';
import { CreatePostUseCase } from '../usecases/create-post';
import { GetPostUseCase } from '../usecases/get-post';
import { ListPostsUseCase } from '../usecases/list-posts';
import { UpdatePostUseCase } from '../usecases/update-post';
import { DeletePostUseCase } from '../usecases/delete-post';
import { success, error as jsendError } from '../../../utils/jsend';
import {
  CreatePostUseCaseToken,
  GetPostUseCaseToken,
  ListPostsUseCaseToken,
  UpdatePostUseCaseToken,
  DeletePostUseCaseToken,
} from '@zercle/shared/container/tokens';
import {
  CreatePostInputSchema,
  UpdatePostInputSchema,
  PostQuerySchema,
} from '../models/schemas';

export function createPostsHandler(diContainer: DependencyContainer) {
  return {
    handleCreatePost: async (c: Context) => {
      try {
        const createPostUseCase = diContainer.resolve<CreatePostUseCase>(CreatePostUseCaseToken);
        const validatedData = CreatePostInputSchema.parse(await c.req.json());
        
        // Get authorId from authenticated user
        const user = c.get('user');
        if (!user) {
          return jsendError(c, 'Authentication required', 'UNAUTHORIZED', 401);
        }
        
        const result = await createPostUseCase.execute({
          ...validatedData,
          authorId: user.id,
        });
        return success(c, result, 201);
      } catch (err: any) {
        return jsendError(c, err.message || 'Bad Request', 'BAD_REQUEST', 400);
      }
    },

    handleGetPost: async (c: Context) => {
      try {
        const getPostUseCase = diContainer.resolve<GetPostUseCase>(GetPostUseCaseToken);
        const id = c.req.param('id');
        
        if (!id) {
          return jsendError(c, 'Post ID is required', 'BAD_REQUEST', 400);
        }

        const result = await getPostUseCase.execute({ id });
        
        if (!result) {
          return jsendError(c, 'Post not found', 'NOT_FOUND', 404);
        }

        return success(c, result);
      } catch (err: any) {
        return jsendError(c, err.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
      }
    },

    handleListPosts: async (c: Context) => {
      try {
        const listPostsUseCase = diContainer.resolve<ListPostsUseCase>(ListPostsUseCaseToken);
        const query = PostQuerySchema.parse({
          page: c.req.query('page'),
          limit: c.req.query('limit'),
          published: c.req.query('published'),
          authorId: c.req.query('authorId'),
        });

        const result = await listPostsUseCase.execute(query);
        return success(c, result);
      } catch (err: any) {
        return jsendError(c, err.message || 'Bad Request', 'BAD_REQUEST', 400);
      }
    },

    handleUpdatePost: async (c: Context) => {
      try {
        const updatePostUseCase = diContainer.resolve<UpdatePostUseCase>(UpdatePostUseCaseToken);
        const id = c.req.param('id');
        
        if (!id) {
          return jsendError(c, 'Post ID is required', 'BAD_REQUEST', 400);
        }

        const validatedData = UpdatePostInputSchema.parse(await c.req.json());
        
        // Get authorId from authenticated user for authorization
        const user = c.get('user');
        if (!user) {
          return jsendError(c, 'Authentication required', 'UNAUTHORIZED', 401);
        }
        
        const result = await updatePostUseCase.execute({
          id,
          ...validatedData,
          authorId: user.id,
        });

        if (!result) {
          return jsendError(c, 'Post not found', 'NOT_FOUND', 404);
        }

        return success(c, result);
      } catch (err: any) {
        if (err.message === 'Unauthorized to update this post') {
          return jsendError(c, err.message, 'FORBIDDEN', 403);
        }
        return jsendError(c, err.message || 'Bad Request', 'BAD_REQUEST', 400);
      }
    },

    handleDeletePost: async (c: Context) => {
      try {
        const deletePostUseCase = diContainer.resolve<DeletePostUseCase>(DeletePostUseCaseToken);
        const id = c.req.param('id');
        
        if (!id) {
          return jsendError(c, 'Post ID is required', 'BAD_REQUEST', 400);
        }

        // Get authorId from authenticated user for authorization
        const user = c.get('user');
        if (!user) {
          return jsendError(c, 'Authentication required', 'UNAUTHORIZED', 401);
        }
        
        const result = await deletePostUseCase.execute({
          id,
          authorId: user.id,
        });

        return success(c, { success: result.success });
      } catch (err: any) {
        if (err.message === 'Post not found') {
          return jsendError(c, err.message, 'NOT_FOUND', 404);
        }
        if (err.message === 'Unauthorized to delete this post') {
          return jsendError(c, err.message, 'FORBIDDEN', 403);
        }
        return jsendError(c, err.message || 'Internal Server Error', 'INTERNAL_ERROR', 500);
      }
    },
  };
}