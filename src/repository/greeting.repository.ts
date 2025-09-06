import { injectable } from 'tsyringe';
import { IGreetingRepository } from './interfaces/greeting.repository.interface';
import { Greeting } from '../domain/models/greeting.model';

// In-memory implementation for demonstration
@injectable()
export class GreetingRepository implements IGreetingRepository {
  private greetings: Greeting[] = [];

  constructor() {
    // Initialize with a default greeting
    this.greetings.push({
      id: '1',
      message: 'Hello Hono from Repository!',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findById(id: string): Promise<Greeting | null> {
    return this.greetings.find((g) => g.id === id) || null;
  }

  async findAll(): Promise<Greeting[]> {
    return this.greetings;
  }

  async create(entity: Greeting): Promise<Greeting> {
    const newGreeting = {
      ...entity,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.greetings.push(newGreeting);
    return newGreeting;
  }

  async update(id: string, entity: Partial<Greeting>): Promise<Greeting | null> {
    const index = this.greetings.findIndex((g) => g.id === id);
    if (index === -1) {
      return null;
    }
    this.greetings[index] = { ...this.greetings[index], ...entity, updatedAt: new Date() };
    return this.greetings[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.greetings.length;
    this.greetings = this.greetings.filter((g) => g.id !== id);
    return this.greetings.length < initialLength;
  }
}
