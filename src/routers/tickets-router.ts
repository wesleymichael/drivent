import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getAllTicketsTypes } from '@/controllers/tickets-controller';

const ticketRouter = Router();

ticketRouter.use(authenticateToken);
ticketRouter.get('/types', getAllTicketsTypes);

export { ticketRouter };
