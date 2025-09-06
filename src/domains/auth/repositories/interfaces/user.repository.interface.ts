import { IRepository } from '../../../../shared/base/interfaces/repository.interface';
import { User } from '../models/user.model';

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
