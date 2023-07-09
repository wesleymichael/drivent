import { prisma } from '@/config';
import { CreatePayment } from '@/protocols';

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

async function createTicketPayment(data: CreatePayment) {
  return await prisma.payment.create({
    data,
  });
}

const paymentsRepository = {
  findPaymentByTicketId,
  checkTicketOwnership,
  createTicketPayment,
};

export default paymentsRepository;
