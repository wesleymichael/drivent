import { Payment } from '@prisma/client';
import { invalidTicketOwnershipError } from './errors';
import paymentsRepository from '@/repositories/payments-repository';
import { notFoundDataError, unsentData } from '@/errors';
import ticketRepository from '@/repositories/ticket-repository';
import { BodyPayment, CreatePayment } from '@/protocols';

async function getPaymentsByTicketId(ticketId: number, userId: number): Promise<Payment | null> {
  if (!ticketId) {
    throw unsentData('Unsent ticketId!');
  }

  const ticket = await ticketRepository.getTicket(ticketId);
  if (!ticket) {
    throw notFoundDataError('TicketId not exist!');
  }

  const validateTicketUser = await ticketRepository.checkTicketOwnership(ticketId, userId);

  if (!validateTicketUser) {
    throw invalidTicketOwnershipError();
  }

  const payment = await paymentsRepository.findPaymentByTicketId(ticketId);
  if (!payment) {
    throw notFoundDataError('Payment not found!');
  }
  return payment;
}

async function createTicketPayment(bodyPayment: BodyPayment, userId: number): Promise<Payment | null> {
  const { ticketId, cardData } = bodyPayment;
  if (!ticketId) {
    throw unsentData('Unsent ticketId!');
  }
  if (!cardData) {
    throw unsentData('Unset cardData!');
  }

  const ticket = await ticketRepository.getTicket(ticketId);
  if (!ticket) {
    throw notFoundDataError('Ticket not found!');
  }

  const validateTicketUser = await ticketRepository.checkTicketOwnership(ticketId, userId);

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
