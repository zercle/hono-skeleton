import { injectable, inject } from 'tsyringe';
import { Context } from 'hono';
import { BaseHandler } from '../../../shared/base/handlers/base.handler';
import { IGreetingUseCase } from '../usecase/interfaces/greeting.usecase.interface';

@injectable()
export class GreetingHandler extends BaseHandler {
  constructor(@inject('IGreetingUseCase') private greetingUseCase: IGreetingUseCase) {
    super();
  }

  public getGreeting = async (c: Context) => {
    try {
      const greeting = await this.greetingUseCase.getGreeting();
      return this.successResponse(c, greeting, 'Greeting fetched successfully');
    } catch (error) {
      return this.errorResponse(c, 'Failed to fetch greeting', 500, error);
    }
  };

  public createGreeting = async (c: Context) => {
    try {
      const { message } = await c.req.json();
      if (!message) {
        return this.errorResponse(c, 'Message is required', 400);
      }
      const newGreeting = await this.greetingUseCase.createGreeting(message);
      return this.successResponse(c, newGreeting, 'Greeting created successfully', 201);
    } catch (error) {
      return this.errorResponse(c, 'Failed to create greeting', 500, error);
    }
  };
}
