import { IRepository } from '../../../../shared/base/interfaces/repository.interface';
import { Greeting } from '../models/greeting.model';

export interface IGreetingRepository extends IRepository<Greeting> {
  // Specific methods for Greeting entity if any, beyond generic CRUD
}
