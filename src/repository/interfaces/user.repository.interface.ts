import { IRepository } from '../../domain/interfaces/repository.interface';
import { User } from '../../domain/models/user.model';

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
