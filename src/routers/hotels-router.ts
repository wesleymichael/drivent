import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getHotels } from '@/controllers';

const hotelsRouter = Router();
hotelsRouter
  .use(authenticateToken)
  .get('/', getHotels)
  .get('/:hotelId', () => console.log('getHotelById'));

export { hotelsRouter };
