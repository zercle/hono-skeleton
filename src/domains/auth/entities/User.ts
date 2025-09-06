import type { Entity } from '@/shared/types/common';

export interface User extends Entity {
  email: string;
  password: string;
  name: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: Date | null;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedUser {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}