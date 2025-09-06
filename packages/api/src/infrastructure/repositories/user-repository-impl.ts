import { injectable } from 'tsyringe';
import { IUserRepository } from '../../domains/auth/repositories/user-repository';
import { User } from '../../domains/auth/entities/user';
import { db } from '@zercle/db';
import { users } from '@zercle/db/schema';
import { eq } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

@injectable()
export class UserRepositoryImpl implements IUserRepository {
  async create(userData: {
    email: string;
    passwordHash: string;
    name?: string;
  }): Promise<User> {
    const newUser = {
      id: uuidv7(),
      email: userData.email,
      password: userData.passwordHash, // Maps to the password field in schema
      name: userData.name || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [insertedUser] = await db.insert(users).values(newUser).returning();

    return {
      id: insertedUser.id,
      email: insertedUser.email,
      passwordHash: insertedUser.password,
      name: insertedUser.name || undefined,
      createdAt: insertedUser.createdAt,
      updatedAt: insertedUser.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.password,
      name: user.name || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.password,
      name: user.name || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
