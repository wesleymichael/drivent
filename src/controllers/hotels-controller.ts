import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const hotels = await hotelService.getHotels(userId);
    return hotels;
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
