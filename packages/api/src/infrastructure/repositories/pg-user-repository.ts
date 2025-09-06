import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IUserRepository } from '../../domains/auth/repositories/user-repository';
import { User } from '../../domains/auth/entities/user';
import { users } from '../../../../db/src/schema';

export class PgUserRepository implements IUserRepository {
  constructor(private db: NodePgDatabase) {}

  async create(user: {
    email: string;
    passwordHash: string;
    name?: string;
  }): Promise<User> {
    const [newUser] = await this.db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
      })
      .returning();

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    return {
      id: newUser.id,
      email: newUser.email,
      passwordHash: newUser.passwordHash,
      name: newUser.name || undefined,
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
    const foundUser = user[0];
    return {
      id: foundUser.id,
      email: foundUser.email,
      passwordHash: foundUser.passwordHash,
      name: foundUser.name || undefined,
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
    const foundUser = user[0];
    return {
      id: foundUser.id,
      email: foundUser.email,
      passwordHash: foundUser.passwordHash,
      name: foundUser.name || undefined,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt,
    };
  }
}
