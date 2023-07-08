import { ApplicationError } from '@/protocols';

export function unsentTicketId(): ApplicationError {
  return {
    name: 'UnsetTicketId',
    message: 'Unsent ticketId.',
  };
}
