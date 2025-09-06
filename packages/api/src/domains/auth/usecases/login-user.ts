import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { injectable, inject } from 'tsyringe';
import { User } from '../entities/user';
import { IUserRepository } from '../repositories/user-repository';
import { LoginUserInputSchema } from '../models/schemas';
import {
  ConfigToken,
  UserRepositoryToken,
} from '@zercle/shared/container/tokens';
import { IConfigService } from '../../infrastructure/config/config.interface';

interface LoginUserInput {
  email: string;
  password: string;
}

interface LoginUserOutput {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(UserRepositoryToken) private userRepository: IUserRepository,
    @inject(ConfigToken) private configService: IConfigService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // Validate input using Zod schema
    const validatedInput = LoginUserInputSchema.parse(input);

    // Find user by email
    const user = await this.userRepository.findByEmail(validatedInput.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await compare(
      validatedInput.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const jwtSecret = this.configService.get<string>('jwt.secret');
    const expiresIn = this.configService.get<string>('jwt.expiresIn');

    const token = sign(
      {
        userId: user.id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: expiresIn }
    );

    // Return token and public user data
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
