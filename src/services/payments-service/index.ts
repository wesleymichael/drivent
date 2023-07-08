import { Payment } from '@prisma/client';
import { invalidTicketOwnershipError, ticketNotFound, unsentTicketId } from './errors';
import paymentsRepository from '@/repositories/payments-repository';
import { notFoundError } from '@/errors';
import ticketRepository from '@/repositories/ticket-repository';

async function getPaymentsByTicketId(ticketId: number, userId: number): Promise<Payment | null> {
  if (!ticketId) {
    console.log('TicketId não enviado');
    throw unsentTicketId();
  }

  const ticket = await ticketRepository.getTicket(ticketId);
  if (!ticket) {
    console.log('TicketId não existe');
    throw ticketNotFound();
  }

  const validateTicketUser = await paymentsRepository.checkTicketOwnership(ticketId, userId);

  if (!validateTicketUser) {
    console.log('TicketId não pertence ao UserId');
    throw invalidTicketOwnershipError();
  }

  const payment = await paymentsRepository.findPaymentByTicketId(ticketId);
  if (!payment) {
    console.log('Sem pagamento');
    throw notFoundError();
  }
  return payment;
}

const paymentService = {
  getPaymentsByTicketId,
};

export default paymentService;
