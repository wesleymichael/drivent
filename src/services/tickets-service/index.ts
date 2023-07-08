import { Ticket, TicketType } from '@prisma/client';
import ticketRepository from '@/repositories/ticket-repository';
import { notFoundError } from '@/errors';

async function getAllTicketsTypes(): Promise<TicketType[]> {
  const allTicketsTypes = await ticketRepository.findAllTicketsTypes();
  return allTicketsTypes;
}

type TicketWithTicketType = Ticket & { TicketType: TicketType };

async function getTicketById(userId: number): Promise<TicketWithTicketType | null> {
  const ticket = await ticketRepository.findTicketById(userId);

  if (!ticket || !ticket.TicketType) {
    throw notFoundError();
  }

  return ticket;
}

const ticketService = {
  getAllTicketsTypes,
  getTicketById,
};

export default ticketService;
