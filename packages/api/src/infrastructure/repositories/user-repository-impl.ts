import { injectable } from 'tsyringe';
import { IUserRepository } from '../../domains/auth/repositories/user-repository';
import { User } from '../../domains/auth/entities/user';
import { getDbClient } from '@zercle/db/client'; // Import the db client from the new module
import { users } from '@zercle/db/schema/users'; // Import the users schema
import { eq } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';

@injectable()
export class UserRepositoryImpl implements IUserRepository {
  async create(userData: {
    email: string;
    password: string;
    name?: string | null;
  }): Promise<User> {
    const db = getDbClient(); // Get the db client instance

    const newUser = {
      id: uuidv7(),
      email: userData.email,
      password: userData.password, // Use directly from input
      name: userData.name || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(users).values(newUser).returning();
    const insertedUser = result[0]; // Get the first element from the returned array

    if (!insertedUser) {
      throw new Error('Failed to create user: No user returned after insertion.');
    }

    return {
      id: insertedUser.id,
      email: insertedUser.email,
      password: insertedUser.password,
      name: insertedUser.name,
      createdAt: insertedUser.createdAt,
      updatedAt: insertedUser.updatedAt,
    } as User; // Cast to User to satisfy the return type
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = getDbClient(); // Get the db client instance
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
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as User; // Cast to User to satisfy the return type
  }

  async findById(id: string): Promise<User | null> {
    const db = getDbClient(); // Get the db client instance
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
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as User; // Cast to User to satisfy the return type
  }
}
