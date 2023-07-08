import { prisma } from '@/config';

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: { ticketId: ticketId },
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

const paymentsRepository = {
  findPaymentByTicketId,
  checkTicketOwnership,
};

export default paymentsRepository;
