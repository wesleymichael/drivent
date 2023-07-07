import { prisma } from '@/config';

async function findAllTicketsTypes() {
  return prisma.ticketType.findMany({});
}

const ticketRepository = {
  findAllTicketsTypes,
};

export default ticketRepository;
