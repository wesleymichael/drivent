import { prisma } from '@/config';
import { CreatePayment } from '@/protocols';

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: { ticketId: ticketId },
  });
}

async function createTicketPayment(data: CreatePayment) {
  return await prisma.payment.create({
    data,
  });
}

const paymentsRepository = {
  findPaymentByTicketId,
  createTicketPayment,
};

export default paymentsRepository;
