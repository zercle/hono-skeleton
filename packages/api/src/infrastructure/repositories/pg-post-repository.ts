import { eq, and, desc, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { uuidv7 } from 'uuidv7';
import { IPostRepository, PostListResult } from '../../domains/posts/repositories/post-repository';
import { Post } from '../../domains/posts/entities/post';
import { CreatePostInput, UpdatePostInput, InternalPostQuery } from '../../domains/posts/models/schemas';
import { posts } from '../../../../db/src/schema';

export class PgPostRepository implements IPostRepository {
  constructor(private db: NodePgDatabase) {}

  async create(postData: CreatePostInput & { authorId: string }): Promise<Post> {
    const [newPost] = await this.db
      .insert(posts)
      .values({
        id: uuidv7(),
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt || null,
        published: postData.published ?? false,
        authorId: postData.authorId,
      })
      .returning();

    if (!newPost) {
      throw new Error('Failed to create post');
    }

    return {
      id: newPost.id,
      title: newPost.title,
      content: newPost.content,
      excerpt: newPost.excerpt,
      published: newPost.published,
      authorId: newPost.authorId,
      createdAt: newPost.createdAt,
      updatedAt: newPost.updatedAt,
    };
  }

  async findById(id: string): Promise<Post | null> {
    const result = await this.db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const post = result[0]!;
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      published: post.published,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  async findByAuthorId(authorId: string): Promise<Post[]> {
    const result = await this.db
      .select()
      .from(posts)
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt));

    return result.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      published: post.published,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));
  }

  async findAll(query: InternalPostQuery): Promise<PostListResult> {
    const { page = 1, limit = 10, published, authorId } = query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (published !== undefined) {
      conditions.push(eq(posts.published, published));
    }
    if (authorId) {
      conditions.push(eq(posts.authorId, authorId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(posts)
      .where(whereClause);

    const total = totalResult?.count ?? 0;

    // Get posts with pagination
    const result = await this.db
      .select()
      .from(posts)
      .where(whereClause)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    const postsData = result.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      published: post.published,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return {
      posts: postsData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updateData: UpdatePostInput): Promise<Post | null> {
    const [updatedPost] = await this.db
      .update(posts)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    if (!updatedPost) {
      return null;
    }

    return {
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      excerpt: updatedPost.excerpt,
      published: updatedPost.published,
      authorId: updatedPost.authorId,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
    };
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning();

    return result.length > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const result = await this.db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    return result.length > 0;
  }
}