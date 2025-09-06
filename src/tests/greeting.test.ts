import 'reflect-metadata';
import { describe, it, expect } from 'bun:test';
import { GreetingRepository } from '../repository/greeting.repository';
import { GreetingUseCase } from '../usecase/greeting.usecase';

describe('Greeting Domain', () => {
  describe('GreetingRepository', () => {
    it('should return all greetings', async () => {
      const repository = new GreetingRepository();
      const greetings = await repository.findAll();

      expect(greetings).toBeDefined();
      expect(greetings.length).toBeGreaterThan(0);
      expect(greetings[0].message).toBe('Hello Hono from Repository!');
    });

    it('should create a new greeting', async () => {
      const repository = new GreetingRepository();
      const newGreeting = {
        id: '',
        message: 'Test greeting',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await repository.create(newGreeting);

      expect(result).toBeDefined();
      expect(result.message).toBe('Test greeting');
      expect(result.id).toBeTruthy();
    });
  });

  describe('GreetingUseCase', () => {
    it('should get greeting through use case', async () => {
      const repository = new GreetingRepository();
      const useCase = new GreetingUseCase(repository);

      const greeting = await useCase.getGreeting();

      expect(greeting).toBeDefined();
      expect(greeting.message).toBe('Hello Hono from Repository!');
    });

    it('should create greeting through use case', async () => {
      const repository = new GreetingRepository();
      const useCase = new GreetingUseCase(repository);

      const result = await useCase.createGreeting('Test message');

      expect(result).toBeDefined();
      expect(result.message).toBe('Test message');
      expect(result.id).toBeTruthy();
    });
  });
});