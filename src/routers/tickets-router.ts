import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getAllTicketsTypes, getTicket, postTicket } from '@/controllers/tickets-controller';

const ticketRouter = Router();

// eslint-disable-next-line prettier/prettier
ticketRouter
  .use(authenticateToken)
  .get('/types', getAllTicketsTypes)
  .get('/', getTicket)
  .post('/', postTicket);

export { ticketRouter };
