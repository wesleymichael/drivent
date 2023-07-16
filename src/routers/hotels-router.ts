import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getHotels, getRoomsByHotelId } from '@/controllers';

const hotelsRouter = Router();
hotelsRouter.use(authenticateToken).get('/', getHotels).get('/:hotelId', getRoomsByHotelId);

export { hotelsRouter };
