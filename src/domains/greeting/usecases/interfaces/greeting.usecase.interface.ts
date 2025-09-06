import { Greeting } from '../models/greeting.model';

export interface IGreetingUseCase {
  getGreeting(): Promise<Greeting>;
  createGreeting(message: string): Promise<Greeting>;
}
