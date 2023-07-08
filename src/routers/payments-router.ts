import { Router } from 'express';
import { getPaymentsByTicketId } from '@/controllers/payments-controllers';
import { authenticateToken } from '@/middlewares';

const paymentsRouter = Router();

paymentsRouter.use(authenticateToken);
paymentsRouter.get('/', getPaymentsByTicketId);

export { paymentsRouter };
