import { uuidv7 } from 'uuidv7';
import { IPostRepository, PostListResult } from '../repositories/post-repository';
import { Post } from '../entities/post';
import { CreatePostInput, UpdatePostInput, InternalPostQuery } from '../models/schemas';

export class MockPostRepository implements IPostRepository {
  private posts = new Map<string, Post>();

  async create(postData: CreatePostInput & { authorId: string }): Promise<Post> {
    const newPost: Post = {
      id: uuidv7(),
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || null,
      published: postData.published ?? false,
      authorId: postData.authorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.posts.set(newPost.id, newPost);
    return newPost;
  }

  async findById(id: string): Promise<Post | null> {
    return this.posts.get(id) || null;
  }

  async findByAuthorId(authorId: string): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.authorId === authorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findAll(query: InternalPostQuery): Promise<PostListResult> {
    const { page = 1, limit = 10, published, authorId } = query;
    
    let filteredPosts = Array.from(this.posts.values());

    // Apply filters
    if (published !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.published === published);
    }
    if (authorId) {
      filteredPosts = filteredPosts.filter(post => post.authorId === authorId);
    }

    // Sort by creation date (newest first)
    filteredPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const total = filteredPosts.length;
    const offset = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    return {
      posts: paginatedPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updateData: UpdatePostInput): Promise<Post | null> {
    const existingPost = this.posts.get(id);
    if (!existingPost) {
      return null;
    }

    const updatedPost: Post = {
      ...existingPost,
      ...updateData,
      updatedAt: new Date(),
    };

    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async delete(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  async existsById(id: string): Promise<boolean> {
    return this.posts.has(id);
  }

  // Test helper methods
  clear(): void {
    this.posts.clear();
  }

  getAll(): Post[] {
    return Array.from(this.posts.values());
  }

  count(): number {
    return this.posts.size;
  }
}