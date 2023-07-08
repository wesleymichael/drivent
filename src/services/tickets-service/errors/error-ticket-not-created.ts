import { ApplicationError } from '@/protocols';

export function ticketNotCreated(): ApplicationError {
  return {
    name: 'TicketNotCreated',
    message: 'Error creating ticket',
  };
}
