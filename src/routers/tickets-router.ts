import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getAllTicketsTypes, getTicket, postTicket } from '@/controllers';
import { ticketsSchema } from '@/schemas/tickets-schemas';

const ticketsRouter = Router();

// eslint-disable-next-line prettier/prettier
ticketsRouter
  .use(authenticateToken)
  .get('/types', getAllTicketsTypes)
  .get('/', getTicket)
  .post('/', validateBody(ticketsSchema), postTicket);

export { ticketsRouter };
