import { Post } from '../models/post.model';

export interface IPostUseCase {
  getAllPosts(): Promise<Post[]>;
  getPostById(id: string): Promise<Post | null>;
  getPostsByAuthor(authorId: string): Promise<Post[]>;
  createPost(title: string, content: string, authorId: string): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | null>;
  deletePost(id: string): Promise<boolean>;
}