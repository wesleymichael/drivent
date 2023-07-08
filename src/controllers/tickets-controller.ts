import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import ticketService from '@/services/tickets-service';

export async function getAllTicketsTypes(req: AuthenticatedRequest, res: Response) {
  try {
    const allTicketsTypes = await ticketService.getAllTicketsTypes();
    return res.status(httpStatus.OK).send(allTicketsTypes);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getTicket(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const ticket = await ticketService.getTicketById(userId);
    return res.status(httpStatus.OK).send(ticket);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
