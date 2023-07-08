import { ApplicationError } from '@/protocols';

export function invalidTicketOwnershipError(): ApplicationError {
  return {
    name: 'InvalidTicketOwnershipError',
    message: 'TicketId does not belong to userId',
  };
}
