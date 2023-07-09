import { Router } from 'express';
import { createTicketPayment, getPaymentsByTicketId } from '@/controllers/payments-controllers';
import { authenticateToken } from '@/middlewares';

const paymentsRouter = Router();

// eslint-disable-next-line prettier/prettier
paymentsRouter
  .use(authenticateToken)
  .get('/', getPaymentsByTicketId)
  .post('/process', createTicketPayment);

export { paymentsRouter };
