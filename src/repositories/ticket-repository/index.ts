import { prisma } from '@/config';

async function findAllTicketsTypes() {
  return prisma.ticketType.findMany({});
}

async function findTicketById(userId: number) {
  return prisma.ticket.findUnique({
    include: {
      TicketType: true,
    },
    where: {
      id: userId,
    },
  });
}

const ticketRepository = {
  findAllTicketsTypes,
  findTicketById,
};

export default ticketRepository;
