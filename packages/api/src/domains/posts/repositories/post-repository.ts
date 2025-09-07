import { Post } from '../entities/post';
import { CreatePostInput, UpdatePostInput, InternalPostQuery } from '../models/schemas';

export interface PostListResult {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPostRepository {
  create(post: CreatePostInput & { authorId: string }): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findByAuthorId(authorId: string): Promise<Post[]>;
  findAll(query: InternalPostQuery): Promise<PostListResult>;
  update(id: string, post: UpdatePostInput): Promise<Post | null>;
  delete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}