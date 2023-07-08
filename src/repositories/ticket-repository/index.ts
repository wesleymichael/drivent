import { prisma } from '@/config';

async function findAllTicketsTypes() {
  return prisma.ticketType.findMany({});
}

async function findTicketById(userId: number) {
  return await prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId: userId,
      },
    },
    include: {
      TicketType: true,
    },
  });
}

async function createTicket(ticketTypeId: number, enrollmentId: number) {
  return prisma.ticket.create({
    data: {
      ticketTypeId,
      enrollmentId,
      status: 'RESERVED',
    },
  });
}

const ticketRepository = {
  findAllTicketsTypes,
  findTicketById,
  createTicket,
};

export default ticketRepository;
