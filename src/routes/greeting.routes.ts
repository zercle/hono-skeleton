import { Hono } from 'hono';
import { container } from '../infrastructure/container/di.container';
import { GreetingHandler } from '../handler/greeting.handler';

const greetingRoutes = new Hono();

// Resolve handler from DI container
const greetingHandler = container.resolve(GreetingHandler);

greetingRoutes.get('/', greetingHandler.getGreeting);
greetingRoutes.post('/', greetingHandler.createGreeting);

export { greetingRoutes };
