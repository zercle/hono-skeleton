import { BaseEntity } from '../../../shared/base/entities/base.entity';

export interface User extends BaseEntity {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}
