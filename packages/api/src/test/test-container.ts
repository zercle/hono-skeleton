import { DependencyContainer } from 'tsyringe';
import { TOKENS } from '@zercle/shared/container/tokens';
import { IUserRepository } from '../../src/domains/auth/repositories/user-repository';
import { User } from '../../src/domains/auth/entities/user';
import { uuidv7 } from 'uuidv7';
import { RegisterUserUseCase } from '../../src/domains/auth/usecases/register-user';
import { LoginUserUseCase } from '../../src/domains/auth/usecases/login-user';
import { IConfigService } from '../../src/infrastructure/config/config.interface';
import { ILoggerService } from '../../src/infrastructure/logging/logger.interface';

class MockLoggerService implements ILoggerService {
  debug(_message: string, _context?: Record<string, unknown>): void {
    // console.log(`DEBUG: ${message}`, context);
  }
  info(_message: string, _context?: Record<string, unknown>): void {
    // console.log(`INFO: ${message}`, context);
  }
  warn(_message: string, _context?: Record<string, unknown>): void {
    // console.log(`WARN: ${message}`, context);
  }
  error(_message: string, _context?: Record<string, unknown>): void {
    // console.error(`ERROR: ${message}`, context);
  }
}

// Mock ConfigService for testing
class MockConfigService implements IConfigService {
  get<T>(key: string): T {
    switch (key) {
      case 'database.url':
        return 'postgres://user:password@localhost:5432/test_db' as T;
      case 'jwt.secret':
        return 'test_secret' as T;
      case 'jwt.expiresIn':
        return '1h' as T;
      case 'server.port':
        return 3000 as T;
      case 'server.host':
        return '0.0.0.0' as T;
      case 'logging.level':
        return 'info' as T;
      case 'bcrypt.rounds':
        return 10 as T;
      case 'cors.origins':
        return ['*'] as T;
      default:
        // Provide a default for any other config key that might be accessed
        return {} as T;
    }
  }
}

class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();

  async create(user: { email: string; password: string; name?: string | null }): Promise<User> {
    const newUser: User = {
      id: uuidv7(),
      email: user.email,
      password: user.password,
      name: user.name ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }
}

export function setupTestContainer(container: DependencyContainer): DependencyContainer {
  container.register<IConfigService>(TOKENS.Config, { useClass: MockConfigService });
  container.register<ILoggerService>(TOKENS.Logger, { useClass: MockLoggerService });
  container.register<IUserRepository>(TOKENS.UserRepository, { useClass: InMemoryUserRepository });
  container.register<RegisterUserUseCase>(TOKENS.RegisterUserUseCase, { useClass: RegisterUserUseCase });
  container.register<LoginUserUseCase>(TOKENS.LoginUserUseCase, { useClass: LoginUserUseCase });
  return container;
}