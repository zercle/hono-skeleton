import type { Repository } from '@/shared/types/common';
import type { User, CreateUserData, UpdateUserData } from '../entities/User';

export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByIdWithoutPassword(id: string): Promise<Omit<User, 'password'> | null>;
  findAllWithoutPasswords(limit?: number, offset?: number): Promise<Omit<User, 'password'>[]>;
  updateLastLogin(id: string): Promise<void>;
  createUser(data: CreateUserData): Promise<User>;
  updateUser(id: string, data: UpdateUserData): Promise<User | null>;
  changePassword(id: string, hashedPassword: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
  countTotal(): Promise<number>;
}