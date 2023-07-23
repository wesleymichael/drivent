import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createBooking, getBooking } from '@/controllers/booking-controller';

const bookingRouter = Router();
bookingRouter.use(authenticateToken);
bookingRouter.get('/', getBooking);
bookingRouter.post('/', createBooking);

export { bookingRouter };
