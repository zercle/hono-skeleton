import { container } from 'tsyringe';
import { IGreetingRepository } from '../../domains/greeting/repositories/interfaces/greeting.repository.interface';
import { GreetingRepository } from '../../domains/greeting/repositories/greeting.repository';
import { IGreetingUseCase } from '../../domains/greeting/usecases/interfaces/greeting.usecase.interface';
import { GreetingUseCase } from '../../domains/greeting/usecases/greeting.usecase';
import { GreetingHandler } from '../../domains/greeting/handlers/greeting.handler';
import { IUserRepository } from '../../domains/auth/repositories/interfaces/user.repository.interface';
import { UserRepository } from '../../domains/auth/repositories/user.repository';
import { IAuthUseCase } from '../../domains/auth/usecases/interfaces/auth.usecase.interface';
import { AuthUseCase } from '../../domains/auth/usecases/auth.usecase';
import { AuthHandler } from '../../domains/auth/handlers/auth.handler';
import { IPostRepository } from '../../domains/post/repositories/interfaces/post.repository.interface';
import { PostRepository } from '../../domains/post/repositories/post.repository';
import { IPostUseCase } from '../../domains/post/usecases/interfaces/post.usecase.interface';
import { PostUseCase } from '../../domains/post/usecases/post.usecase';
import { PostHandler } from '../../domains/post/handlers/post.handler';

// Repository registrations
container.register<IGreetingRepository>('IGreetingRepository', {
  useClass: GreetingRepository,
});

container.register<IUserRepository>('IUserRepository', {
  useClass: UserRepository,
});

container.register<IPostRepository>('IPostRepository', {
  useClass: PostRepository,
});

// Use case registrations
container.register<IGreetingUseCase>('IGreetingUseCase', {
  useClass: GreetingUseCase,
});

container.register<IAuthUseCase>('IAuthUseCase', {
  useClass: AuthUseCase,
});

container.register<IPostUseCase>('IPostUseCase', {
  useClass: PostUseCase,
});

// Handler registrations
container.register(GreetingHandler, { useClass: GreetingHandler });
container.register(AuthHandler, { useClass: AuthHandler });
container.register(PostHandler, { useClass: PostHandler });

export { container };
