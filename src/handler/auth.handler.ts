import { injectable, inject } from 'tsyringe';
import { Context } from 'hono';
import { BaseHandler } from './base.handler';
import { IAuthUseCase } from '../usecase/interfaces/auth.usecase.interface';
import { LoginRequest, RegisterRequest } from '../domain/models/user.model';

@injectable()
export class AuthHandler extends BaseHandler {
  constructor(@inject('IAuthUseCase') private authUseCase: IAuthUseCase) {
    super();
  }

  public register = async (c: Context) => {
    try {
      const request: RegisterRequest = await c.req.json();

      // Basic validation
      if (!request.email || !request.password) {
        return this.errorResponse(c, 'Email and password are required', 400);
      }

      const result = await this.authUseCase.register(request);
      return this.successResponse(c, result, 'User registered successfully', 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return this.errorResponse(c, message, 400, error);
    }
  };

  public login = async (c: Context) => {
    try {
      const request: LoginRequest = await c.req.json();

      // Basic validation
      if (!request.email || !request.password) {
        return this.errorResponse(c, 'Email and password are required', 400);
      }

      const result = await this.authUseCase.login(request);
      return this.successResponse(c, result, 'Login successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return this.errorResponse(c, message, 401, error);
    }
  };

  public profile = async (c: Context) => {
    try {
      const userId = c.get('userId');

      // In a real application, you would fetch the user profile here
      return this.successResponse(c, { userId }, 'Profile fetched successfully');
    } catch (error) {
      return this.errorResponse(c, 'Failed to fetch profile', 500, error);
    }
  };
}
