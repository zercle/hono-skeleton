import { User } from '../entities/user';

export interface IUserRepository {
  create(user: {
    email: string;
    passwordHash: string;
    name?: string;
  }): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
