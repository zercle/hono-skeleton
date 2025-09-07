import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken'; // Remove JwtPayload and Algorithm imports
import { injectable, inject } from 'tsyringe';
import { type User } from '../entities/user';
import { type IUserRepository } from '../repositories/user-repository';
import { LoginUserInputSchema } from '../models/schemas';
import {
  ConfigToken,
  UserRepositoryToken,
} from '@zercle/shared/container/tokens';
import { type IConfigService } from '@/infrastructure/config/config.interface';

interface LoginUserInput {
  email: string;
  password: string;
}

interface LoginUserOutput {
  token: string;
  user: Pick<User, 'id' | 'email' | 'name' | 'createdAt' | 'updatedAt'>;
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
      user.password
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const jwtSecret = this.configService.get<string>('jwt.secret');
    const expiresIn = this.configService.get<string>('jwt.expiresIn');

    if (!jwtSecret) {
      throw new Error('JWT secret is not configured.');
    }

    const token = (sign as any)(
      {
        userId: user.id,
        email: user.email,
      } as any, // Cast payload to any
      jwtSecret,
      { expiresIn, algorithm: 'HS256' as any }
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
