import { injectable } from 'tsyringe';
import { IPostRepository } from './interfaces/post.repository.interface';
import { Post } from '../domain/models/post.model';
import prisma from '../infrastructure/database/connection';

@injectable()
export class PostRepository implements IPostRepository {
  async findById(id: string): Promise<Post | null> {
    const post = await prisma.post.findUnique({ where: { id } });
    return post;
  }

  async findAll(): Promise<Post[]> {
    return await prisma.post.findMany();
  }

  async create(entity: Post): Promise<Post> {
    return await prisma.post.create({
      data: {
        title: entity.title,
        content: entity.content,
        authorId: entity.authorId,
      },
    });
  }

  async update(id: string, entity: Partial<Post>): Promise<Post | null> {
    try {
      return await prisma.post.update({
        where: { id },
        data: entity,
      });
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.post.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByAuthorId(authorId: string): Promise<Post[]> {
    return await prisma.post.findMany({ where: { authorId } });
  }
}