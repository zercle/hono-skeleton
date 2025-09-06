import { uuidv7 } from 'uuidv7';
import { hash } from 'bcryptjs';
import { container, injectable, inject } from 'tsyringe';
import { User } from '../entities/user';
import { IUserRepository } from '../repositories/user-repository';
import { RegisterUserInputSchema } from '../models/schemas';
import {
  ConfigToken,
  UserRepositoryToken,
} from '@zercle/shared/container/tokens';
import { IConfigService } from '../../infrastructure/config/config.interface';

interface RegisterUserInput {
  email: string;
  password: string;
  name?: string;
}

interface RegisterUserOutput {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(UserRepositoryToken) private userRepository: IUserRepository,
    @inject(ConfigToken) private configService: IConfigService
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Validate input using Zod schema
    const validatedInput = RegisterUserInputSchema.parse(input);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      validatedInput.email
    );
    if (existingUser) {
      throw new Error('User already exists');
    }

    const bcryptRounds = this.configService.get<number>('bcrypt.rounds');

    // Hash password
    const passwordHash = await hash(validatedInput.password, bcryptRounds);

    // Create user with UUIDv7 ID
    const newUser: User = {
      id: uuidv7(),
      email: validatedInput.email,
      passwordHash,
      name: validatedInput.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save user
    const savedUser = await this.userRepository.create(newUser);

    // Return public user data (without password hash)
    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }
}
