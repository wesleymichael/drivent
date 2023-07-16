import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const hotels = await hotelService.getHotels(userId);
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === 'PaymentRequired') {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getRoomsByHotelId(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const hotelId = Number(req.params.hotelId);
  try {
    const hotelWithRooms = hotelService.getRoomsByHotelId(userId, hotelId);
    return res.send(hotelWithRooms);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === 'PaymentRequired') {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if (error.name === 'UnsentData') {
      return res.status(httpStatus.BAD_REQUEST).send(error.message);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
