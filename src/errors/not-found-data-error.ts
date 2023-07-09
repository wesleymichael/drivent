import { ApplicationError } from '@/protocols';

export function notFoundDataError(message: string): ApplicationError {
  return {
    name: 'NotFoundDataError',
    message: `${message}`,
  };
}
