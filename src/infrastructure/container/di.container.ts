import { container } from 'tsyringe';
import { IGreetingRepository } from '../../repository/interfaces/greeting.repository.interface';
import { GreetingRepository } from '../../repository/greeting.repository';
import { IGreetingUseCase } from '../../usecase/interfaces/greeting.usecase.interface';
import { GreetingUseCase } from '../../usecase/greeting.usecase';
import { GreetingHandler } from '../../handler/greeting.handler';
import { IUserRepository } from '../../repository/interfaces/user.repository.interface';
import { UserRepository } from '../../repository/user.repository';
import { IAuthUseCase } from '../../usecase/interfaces/auth.usecase.interface';
import { AuthUseCase } from '../../usecase/auth.usecase';
import { AuthHandler } from '../../handler/auth.handler';
import { IPostRepository } from '../../repository/interfaces/post.repository.interface';
import { PostRepository } from '../../repository/post.repository';
import { IPostUseCase } from '../../usecase/interfaces/post.usecase.interface';
import { PostUseCase } from '../../usecase/post.usecase';
import { PostHandler } from '../../handler/post.handler';

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
