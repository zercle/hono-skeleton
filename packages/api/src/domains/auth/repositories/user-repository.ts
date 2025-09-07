import { User } from '../entities/user';

export interface IUserRepository {
  create(user: {
    email: string;
    password: string; // Changed to match entity
    name?: string | null; // Changed to match entity
  }): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
