import { uuidv7 } from 'uuidv7';
import { hash } from 'bcryptjs';
import { injectable, inject } from 'tsyringe';
import { type User } from '../entities/user';
import { type IUserRepository } from '../repositories/user-repository';
import { RegisterUserInputSchema } from '../models/schemas';
import {
  ConfigToken,
  UserRepositoryToken,
} from '@zercle/shared/container/tokens';
import { type IConfigService } from '@/infrastructure/config/config.interface';

interface RegisterUserInput {
  email: string;
  password: string;
  name?: string | null; // Optional name, can be string or null
}

interface RegisterUserOutput extends Pick<User, 'id' | 'email' | 'name' | 'createdAt' | 'updatedAt'> {}

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
      password: passwordHash, // Renamed to 'password' to match Drizzle schema
      name: validatedInput.name || null, // Ensure name is null if undefined for Drizzle
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save user
    const savedUser = await this.userRepository.create({
      email: newUser.email,
      password: newUser.password,
      name: newUser.name,
    });

    // Return public user data (without password hash)
    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name, // name is already string | null from the entity
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }
}
