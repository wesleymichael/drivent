import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const booking = await bookingService.getBooking(userId);
    return res.send(booking);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const roomId = Number(req.body.roomId);
  try {
    const bookingId = await bookingService.createBooking(userId, roomId);
    return res.send(bookingId);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === 'UnauthorizedError') {
      return res.status(httpStatus.FORBIDDEN).send(error.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
