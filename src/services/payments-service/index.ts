import { Payment } from '@prisma/client';
import { invalidTicketOwnershipError, ticketNotFound, unsentData } from './errors';
import paymentsRepository from '@/repositories/payments-repository';
import { notFoundError } from '@/errors';
import ticketRepository from '@/repositories/ticket-repository';
import { BodyPayment, CreatePayment } from '@/protocols';

async function getPaymentsByTicketId(ticketId: number, userId: number): Promise<Payment | null> {
  if (!ticketId) {
    throw unsentData('Unsent ticketId');
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

async function createTicketPayment(bodyPayment: BodyPayment, userId: number): Promise<Payment | null> {
  const { ticketId, cardData } = bodyPayment;
  if (!ticketId) {
    throw unsentData('Unsent ticketId');
  }
  if (!cardData) {
    throw unsentData('Unset cardData');
  }

  const ticket = await ticketRepository.getTicket(ticketId);
  if (!ticket) {
    throw ticketNotFound();
  }

  const validateTicketUser = await paymentsRepository.checkTicketOwnership(ticketId, userId);

  if (!validateTicketUser) {
    throw invalidTicketOwnershipError();
  }

  const ticketType = await ticketRepository.getTicketTypePrice(ticket.ticketTypeId);

  const data: CreatePayment = {
    ticketId,
    value: ticketType.price,
    cardIssuer: cardData.issuer,
    cardLastDigits: cardData.number.toString().slice(-4),
  };

  const payment = await paymentsRepository.createTicketPayment(data);

  await ticketRepository.updateTicketStatus(userId);

  return payment;
}

const paymentService = {
  getPaymentsByTicketId,
  createTicketPayment,
};

export default paymentService;
