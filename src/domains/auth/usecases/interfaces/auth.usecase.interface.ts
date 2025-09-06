import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

export interface IAuthUseCase {
  register(request: RegisterRequest): Promise<AuthResponse>;
  login(request: LoginRequest): Promise<AuthResponse>;
  verifyToken(token: string): Promise<{ userId: string } | null>;
}
