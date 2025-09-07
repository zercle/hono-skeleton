import { Context } from 'hono';
import { DependencyContainer } from 'tsyringe';
import { RegisterUserUseCase } from '../usecases/register-user';
import { LoginUserUseCase } from '../usecases/login-user';
import { success, error as jsendError } from '../../../utils/jsend'; // Import error as jsendError to avoid naming conflict
import { RegisterUserUseCaseToken, LoginUserUseCaseToken } from '@zercle/shared/container/tokens';
import {
  RegisterUserInputSchema,
  LoginUserInputSchema,
} from '../models/schemas';

export function createAuthHandler(diContainer: DependencyContainer) {
  return {
    handleRegister: async (c: Context) => {
      try {
        const registerUserUseCase = diContainer.resolve<RegisterUserUseCase>(RegisterUserUseCaseToken);
        const validatedData = RegisterUserInputSchema.parse(await c.req.json());
        const result = await registerUserUseCase.execute({
          ...validatedData,
          name: validatedData.name ?? null,
        });
        return success(c, result);
      } catch (err: any) {
        return jsendError(c, err.message || 'Bad Request', 'BAD_REQUEST', 400);
      }
    },

    handleLogin: async (c: Context) => {
      try {
        const loginUserUseCase = diContainer.resolve<LoginUserUseCase>(LoginUserUseCaseToken);
        const validatedData = LoginUserInputSchema.parse(await c.req.json());
        const result = await loginUserUseCase.execute(validatedData);
        return success(c, result);
      } catch (err: any) {
        return jsendError(c, err.message || 'Unauthorized', 'UNAUTHORIZED', 401);
      }
    },
  };
}
