import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getAllTicketsTypes, getTicket } from '@/controllers/tickets-controller';

const ticketRouter = Router();

ticketRouter.use(authenticateToken).get('/types', getAllTicketsTypes).get('/', getTicket);

export { ticketRouter };
