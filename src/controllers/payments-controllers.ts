import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import paymentService from '@/services/payments-service';
import { BodyPayment } from '@/protocols';

export async function getPaymentsByTicketId(req: AuthenticatedRequest, res: Response) {
  const ticketId = Number(req.query.ticketId);
  const userId = req.userId;

  try {
    const payment = await paymentService.getPaymentsByTicketId(ticketId, userId);
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === 'UnsentData') {
      return res.status(httpStatus.BAD_REQUEST).send(error.message);
    }
    if (error.name === 'InvalidTicketOwnershipError') {
      return res.status(httpStatus.UNAUTHORIZED).send(error.message);
    }
    if (error.name === 'NotFoundDataError' || error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function createTicketPayment(req: AuthenticatedRequest, res: Response) {
  const bodyPayment: BodyPayment = req.body;
  const userId = req.userId;
  try {
    const payment = await paymentService.createTicketPayment(bodyPayment, userId);
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === 'UnsentData') {
      return res.status(httpStatus.BAD_REQUEST).send(error.message);
    }
    if (error.name === 'InvalidTicketOwnershipError') {
      return res.status(httpStatus.UNAUTHORIZED).send(error.message);
    }
    if (error.name === 'NotFoundDataError' || error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
