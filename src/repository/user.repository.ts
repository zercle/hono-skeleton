import { injectable } from 'tsyringe';
import { IUserRepository } from './interfaces/user.repository.interface';
import { User } from '../domain/models/user.model';
import prisma from '../infrastructure/database/connection';

@injectable()
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
  }

  async findAll(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  async create(entity: User): Promise<User> {
    return await prisma.user.create({
      data: {
        email: entity.email,
        password: entity.password,
        name: entity.name,
      },
    });
  }

  async update(id: string, entity: Partial<User>): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id },
        data: entity,
      });
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }
}
