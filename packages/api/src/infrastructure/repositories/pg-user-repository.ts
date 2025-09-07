import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IUserRepository } from '../../domains/auth/repositories/user-repository';
import { User } from '../../domains/auth/entities/user';
import { users } from '../../../../db/src/schema';

export class PgUserRepository implements IUserRepository {
  constructor(private db: NodePgDatabase) {}

  async create(user: {
    email: string;
    password: string; // Changed from passwordHash
    name?: string | null; // Changed to explicitly allow null
  }): Promise<User> {
    const [newUser] = await this.db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: user.email,
        password: user.password, // Changed from passwordHash
        name: user.name || null, // Ensure null for Drizzle
      })
      .returning();

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    return {
      id: newUser.id,
      email: newUser.email,
      password: newUser.password, // Changed from passwordHash
      name: newUser.name, // Drizzle returns null for nullable fields
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (user.length === 0) {
      return null;
    }
    const foundUser = user[0]!;
    return {
      id: foundUser.id,
      email: foundUser.email,
      password: foundUser.password, // Changed from passwordHash
      name: foundUser.name,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (user.length === 0) {
      return null;
    }
    const foundUser = user[0]!;
    return {
      id: foundUser.id,
      email: foundUser.email,
      password: foundUser.password, // Changed from passwordHash
      name: foundUser.name,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt,
    };
  }
}
