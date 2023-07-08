import { Ticket, TicketType } from '@prisma/client';
import { notFoundEnrolment, ticketNotCreated, unsentTicketType } from './errors';
import ticketRepository from '@/repositories/ticket-repository';
import { notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';

async function getAllTicketsTypes(): Promise<TicketType[]> {
  const allTicketsTypes = await ticketRepository.findAllTicketsTypes();
  return allTicketsTypes;
}

type TicketWithTicketType = Ticket & { TicketType: TicketType };

async function getTicketById(userId: number): Promise<TicketWithTicketType | null> {
  const ticketWithTicketType = await ticketRepository.findTicketById(userId);

  if (!ticketWithTicketType || !ticketWithTicketType.TicketType) {
    throw notFoundError();
  }
  return ticketWithTicketType;
}

async function postTicket(ticketTypeId: number, userId: number) {
  if (!ticketTypeId) {
    throw unsentTicketType();
  }

  const enrollment = await enrollmentRepository.findEnrollmentByUserId(userId);

  if (!enrollment) {
    throw notFoundEnrolment();
  }

  const ticket = await ticketRepository.createTicket(ticketTypeId, enrollment.id);
  if (!ticket) {
    throw ticketNotCreated();
  }

  const ticketWithTicketType = await ticketRepository.findTicketById(userId);
  if (!ticketWithTicketType || !ticketWithTicketType.TicketType) {
    throw notFoundError();
  }
  return ticketWithTicketType;
}

const ticketService = {
  getAllTicketsTypes,
  getTicketById,
  postTicket,
};

export default ticketService;
