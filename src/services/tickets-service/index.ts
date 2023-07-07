import { TicketType } from '@prisma/client';
import ticketRepository from '@/repositories/ticket-repository';

async function getAllTicketsTypes(): Promise<TicketType[]> {
  const allTicketsTypes = await ticketRepository.findAllTicketsTypes();
  return allTicketsTypes;
}

const ticketService = {
  getAllTicketsTypes,
};

export default ticketService;
