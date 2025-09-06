import { injectable, inject } from 'tsyringe';
import { Context } from 'hono';
import { BaseHandler } from '../../../shared/base/handlers/base.handler';
import { IPostUseCase } from '../usecase/interfaces/post.usecase.interface';

@injectable()
export class PostHandler extends BaseHandler {
  constructor(@inject('IPostUseCase') private postUseCase: IPostUseCase) {
    super();
  }

  public getAllPosts = async (c: Context) => {
    try {
      const posts = await this.postUseCase.getAllPosts();
      return this.successResponse(c, posts, 'Posts fetched successfully');
    } catch (error) {
      return this.errorResponse(c, 'Failed to fetch posts', 500, error);
    }
  };

  public getPostById = async (c: Context) => {
    try {
      const id = c.req.param('id');
      const post = await this.postUseCase.getPostById(id);

      if (!post) {
        return this.errorResponse(c, 'Post not found', 404);
      }

      return this.successResponse(c, post, 'Post fetched successfully');
    } catch (error) {
      return this.errorResponse(c, 'Failed to fetch post', 500, error);
    }
  };

  public getPostsByAuthor = async (c: Context) => {
    try {
      const authorId = c.req.param('authorId');
      const posts = await this.postUseCase.getPostsByAuthor(authorId);
      return this.successResponse(c, posts, 'Posts fetched successfully');
    } catch (error) {
      return this.errorResponse(c, 'Failed to fetch posts by author', 500, error);
    }
  };

  public createPost = async (c: Context) => {
    try {
      const { title, content } = await c.req.json();
      const userId = c.get('userId'); // From auth middleware

      if (!title) {
        return this.errorResponse(c, 'Title is required', 400);
      }

      if (!userId) {
        return this.errorResponse(c, 'User authentication required', 401);
      }

      const newPost = await this.postUseCase.createPost(title, content || '', userId);
      return this.successResponse(c, newPost, 'Post created successfully', 201);
    } catch (error) {
      return this.errorResponse(c, 'Failed to create post', 500, error);
    }
  };

  public updatePost = async (c: Context) => {
    try {
      const id = c.req.param('id');
      const updates = await c.req.json();

      const updatedPost = await this.postUseCase.updatePost(id, updates);

      if (!updatedPost) {
        return this.errorResponse(c, 'Post not found', 404);
      }

      return this.successResponse(c, updatedPost, 'Post updated successfully');
    } catch (error) {
      return this.errorResponse(c, 'Failed to update post', 500, error);
    }
  };

  public deletePost = async (c: Context) => {
    try {
      const id = c.req.param('id');
      const deleted = await this.postUseCase.deletePost(id);

      if (!deleted) {
        return this.errorResponse(c, 'Post not found', 404);
      }

      return this.successResponse(c, null, 'Post deleted successfully');
    } catch (error) {
      return this.errorResponse(c, 'Failed to delete post', 500, error);
    }
  };
}