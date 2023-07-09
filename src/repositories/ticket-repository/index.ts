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

async function getTicket(ticketId: number) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
  });
}

async function getTicketTypePrice(ticketTypeId: number) {
  return prisma.ticketType.findUnique({
    select: {
      price: true,
    },
    where: {
      id: ticketTypeId,
    },
  });
}

async function checkTicketOwnership(ticketId: number, userId: number) {
  return await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      Enrollment: {
        userId: userId,
      },
    },
  });
}

async function updateTicketStatus(userId: number) {
  return await prisma.ticket.updateMany({
    data: {
      status: 'PAID',
    },
    where: {
      Enrollment: {
        userId: userId,
      },
    },
  });
}

const ticketRepository = {
  findAllTicketsTypes,
  findTicketById,
  createTicket,
  getTicket,
  getTicketTypePrice,
  updateTicketStatus,
  checkTicketOwnership,
};

export default ticketRepository;
