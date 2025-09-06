import { Context } from 'hono';
import { RegisterUserUseCase } from '../usecases/register-user';
import { LoginUserUseCase } from '../usecases/login-user';
import { success } from '../../../utils/jsend';
import { z } from 'zod';
import {
  RegisterUserInputSchema,
  LoginUserInputSchema,
} from '../models/schemas';

interface AuthHandlerDependencies {
  registerUserUseCase: RegisterUserUseCase;
  loginUserUseCase: LoginUserUseCase;
}

export function createAuthHandler(deps: AuthHandlerDependencies) {
  return {
    handleRegister: async (c: Context) => {
      try {
        const validatedData = c.req.valid('json') as z.infer<
          typeof RegisterUserInputSchema
        >;
        const result = await deps.registerUserUseCase.execute(validatedData);
        return success(c, result);
      } catch (error) {
        return c.json({ error: error.message }, 400);
      }
    },

    handleLogin: async (c: Context) => {
      try {
        const validatedData = c.req.valid('json') as z.infer<
          typeof LoginUserInputSchema
        >;
        const result = await deps.loginUserUseCase.execute(validatedData);
        return success(c, result);
      } catch (error) {
        return c.json({ error: error.message }, 401);
      }
    },
  };
}
