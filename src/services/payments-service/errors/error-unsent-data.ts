import { ApplicationError } from '@/protocols';

export function unsentData(message: string): ApplicationError {
  return {
    name: 'UnsentData',
    message: `${message}`,
  };
}
