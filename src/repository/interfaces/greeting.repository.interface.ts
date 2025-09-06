import { IRepository } from '../../domain/interfaces/repository.interface';
import { Greeting } from '../../domain/models/greeting.model';

export interface IGreetingRepository extends IRepository<Greeting> {
  // Specific methods for Greeting entity if any, beyond generic CRUD
}
