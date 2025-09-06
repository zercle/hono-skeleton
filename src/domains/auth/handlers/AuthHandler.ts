import { injectable, inject } from 'tsyringe';
import type { Context } from 'hono';
import { TOKENS } from '@/shared/container/tokens';
import { ResponseHelper } from '@/shared/utils/response';
import { validateSchema, createUserSchema, loginSchema, changePasswordSchema, createPaginationParams } from '@/shared/utils/validation';
import type { CreateUserUseCase } from '../usecases/CreateUserUseCase';
import type { AuthenticateUserUseCase } from '../usecases/AuthenticateUserUseCase';
import type { GetUserUseCase } from '../usecases/GetUserUseCase';
import type { GetUsersUseCase } from '../usecases/GetUsersUseCase';
import type { ChangePasswordUseCase } from '../usecases/ChangePasswordUseCase';
import type { AuthContext } from '@/infrastructure/middleware/auth';

@injectable()
export class AuthHandler {
  constructor(
    @inject(TOKENS.CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
    @inject(TOKENS.AuthenticateUserUseCase) private authenticateUserUseCase: AuthenticateUserUseCase,
    @inject(TOKENS.GetUserUseCase) private getUserUseCase: GetUserUseCase,
    @inject(TOKENS.GetUsersUseCase) private getUsersUseCase: GetUsersUseCase,
    @inject(TOKENS.ChangePasswordUseCase) private changePasswordUseCase: ChangePasswordUseCase
  ) {}

  async register(c: Context) {
    const body = await c.req.json();
    const validatedData = validateSchema(createUserSchema, body);

    const result = await this.createUserUseCase.execute(validatedData);
    
    return ResponseHelper.created(c, result);
  }

  async login(c: Context) {
    const body = await c.req.json();
    const validatedData = validateSchema(loginSchema, body);

    const result = await this.authenticateUserUseCase.execute(validatedData);
    
    return ResponseHelper.success(c, result);
  }

  async getProfile(c: Context) {
    const auth = c.get('auth') as AuthContext;
    
    const result = await this.getUserUseCase.execute({
      userId: auth.userId,
    });
    
    return ResponseHelper.success(c, result);
  }

  async getUser(c: Context) {
    const userId = c.req.param('id');
    
    const result = await this.getUserUseCase.execute({ userId });
    
    return ResponseHelper.success(c, result);
  }

  async getUsers(c: Context) {
    const query = c.req.query();
    const pagination = createPaginationParams(query);

    const result = await this.getUsersUseCase.execute(pagination);
    
    return ResponseHelper.success(c, result);
  }

  async changePassword(c: Context) {
    const auth = c.get('auth') as AuthContext;
    const body = await c.req.json();
    const validatedData = validateSchema(changePasswordSchema, body);

    const result = await this.changePasswordUseCase.execute({
      userId: auth.userId,
      currentPassword: validatedData.currentPassword,
      newPassword: validatedData.newPassword,
    });
    
    return ResponseHelper.success(c, result);
  }

  async refreshToken(c: Context) {
    // TODO: Implement refresh token logic
    // For now, return a simple message
    return ResponseHelper.success(c, { 
      message: 'Refresh token endpoint - to be implemented' 
    });
  }

  async logout(c: Context) {
    // TODO: Implement logout logic (token blacklisting, etc.)
    // For now, return a simple message
    return ResponseHelper.success(c, { 
      message: 'Logout successful' 
    });
  }

  // Health check endpoint for auth service
  async health(c: Context) {
    return ResponseHelper.success(c, {
      service: 'auth',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }
}