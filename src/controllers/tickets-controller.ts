import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import ticketService from '@/services/tickets-service';

export async function getAllTicketsTypes(req: AuthenticatedRequest, res: Response) {
  try {
    const allTicketsTypes = await ticketService.getAllTicketsTypes();
    return res.status(httpStatus.OK).send(allTicketsTypes);
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getTicket(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const ticket = await ticketService.getTicketById(userId);
    return res.status(httpStatus.OK).send(ticket);
  } catch (error) {
    if (error.name === 'NotFoundDataError' || error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function postTicket(req: AuthenticatedRequest, res: Response) {
  const ticketTypeId: number = req.body.ticketTypeId;
  const userId: number = req.userId;
  try {
    const ticket = await ticketService.postTicket(ticketTypeId, userId);
    return res.status(httpStatus.CREATED).send(ticket);
  } catch (error) {
    if (error.name === 'UnsentData' || error.name === 'TicketNotCreated') {
      return res.status(httpStatus.BAD_REQUEST).send(error.message);
    }
    if (error.name === 'NotFoundDataError' || error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
