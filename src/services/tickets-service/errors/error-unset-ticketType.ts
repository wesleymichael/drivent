import { ApplicationError } from '@/protocols';

export function unsentTicketType(): ApplicationError {
  return {
    name: 'UnsetTicketType',
    message: 'Unsent ticket type.',
  };
}
