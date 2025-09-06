import { injectable, inject } from 'tsyringe';
import { eq, count, desc, and } from 'drizzle-orm';
import type { UserRepository } from './UserRepository';
import type { User, CreateUserData, UpdateUserData } from '../entities/User';
import { users } from '@/infrastructure/database/schemas';
import { DatabaseService } from '@/infrastructure/database/connection';
import { LoggerService } from '@/infrastructure/logging/logger';
import { CryptoHelper } from '@/shared/utils/crypto';
import { TOKENS } from '@/shared/container/tokens';
import { DatabaseError, NotFoundError } from '@/shared/types/errors';

@injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(
    @inject(TOKENS.DatabaseService) private databaseService: DatabaseService,
    @inject(TOKENS.Logger) private logger: LoggerService
  ) {}

  async findById(id: string): Promise<User | null> {
    try {
      const db = this.databaseService.getDb();
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.logger.error('Failed to find user by ID', error as Error, { id });
      throw new DatabaseError('Failed to fetch user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const db = this.databaseService.getDb();
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.logger.error('Failed to find user by email', error as Error, { email });
      throw new DatabaseError('Failed to fetch user');
    }
  }

  async findByIdWithoutPassword(id: string): Promise<Omit<User, 'password'> | null> {
    try {
      const db = this.databaseService.getDb();
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          isActive: users.isActive,
          emailVerified: users.emailVerified,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.logger.error('Failed to find user profile by ID', error as Error, { id });
      throw new DatabaseError('Failed to fetch user profile');
    }
  }

  async findAll(limit = 10, offset = 0): Promise<User[]> {
    try {
      const db = this.databaseService.getDb();
      const result = await db
        .select()
        .from(users)
        .where(eq(users.isActive, true))
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      this.logger.error('Failed to find all users', error as Error, { limit, offset });
      throw new DatabaseError('Failed to fetch users');
    }
  }

  async findAllWithoutPasswords(limit = 10, offset = 0): Promise<Omit<User, 'password'>[]> {
    try {
      const db = this.databaseService.getDb();
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          isActive: users.isActive,
          emailVerified: users.emailVerified,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.isActive, true))
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      this.logger.error('Failed to find all user profiles', error as Error, { limit, offset });
      throw new DatabaseError('Failed to fetch user profiles');
    }
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return this.createUser(data);
  }

  async createUser(data: CreateUserData): Promise<User> {
    try {
      const db = this.databaseService.getDb();
      const id = CryptoHelper.generateId();
      const now = new Date();

      const hashedPassword = await CryptoHelper.hashPassword(data.password);

      const result = await db
        .insert(users)
        .values({
          id,
          email: data.email.toLowerCase(),
          password: hashedPassword,
          name: data.name,
          isActive: data.isActive ?? true,
          emailVerified: data.emailVerified ?? false,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      this.logger.info('User created successfully', { id, email: data.email });
      return result[0];
    } catch (error) {
      this.logger.error('Failed to create user', error as Error, { email: data.email });
      throw new DatabaseError('Failed to create user');
    }
  }

  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    return this.updateUser(id, data);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User | null> {
    try {
      const db = this.databaseService.getDb();
      const updateData = {
        ...data,
        ...(data.email && { email: data.email.toLowerCase() }),
        updatedAt: new Date(),
      };

      const result = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (result.length === 0) {
        throw new NotFoundError('User not found');
      }

      this.logger.info('User updated successfully', { id });
      return result[0];
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error('Failed to update user', error as Error, { id });
      throw new DatabaseError('Failed to update user');
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      const db = this.databaseService.getDb();
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      this.logger.debug('Last login updated', { id });
    } catch (error) {
      this.logger.error('Failed to update last login', error as Error, { id });
      // Don't throw here - this is not critical
    }
  }

  async changePassword(id: string, hashedPassword: string): Promise<boolean> {
    try {
      const db = this.databaseService.getDb();
      const result = await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning({ id: users.id });

      this.logger.info('Password changed successfully', { id });
      return result.length > 0;
    } catch (error) {
      this.logger.error('Failed to change password', error as Error, { id });
      throw new DatabaseError('Failed to change password');
    }
  }

  async delete(id: string): Promise<boolean> {
    return this.softDelete(id);
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      const db = this.databaseService.getDb();
      const result = await db
        .update(users)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning({ id: users.id });

      this.logger.info('User soft deleted successfully', { id });
      return result.length > 0;
    } catch (error) {
      this.logger.error('Failed to soft delete user', error as Error, { id });
      throw new DatabaseError('Failed to delete user');
    }
  }

  async countTotal(): Promise<number> {
    try {
      const db = this.databaseService.getDb();
      const result = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.isActive, true));

      return result[0]?.count || 0;
    } catch (error) {
      this.logger.error('Failed to count users', error as Error);
      throw new DatabaseError('Failed to count users');
    }
  }
}