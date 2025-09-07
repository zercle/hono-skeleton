export * from './tokens';
export * from './register';

import { container } from 'tsyringe';

/**
 * Helper function to resolve dependencies from the TSyringe container
 * @param token The dependency token to resolve
 * @returns The resolved dependency
 */
export function resolve<T>(token: symbol | string): T {
  return container.resolve(token);
}
