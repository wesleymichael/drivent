import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { createBooking, getBooking } from '@/controllers/booking-controller';
import { bookingSchema } from '@/schemas/booking-schemas';

const bookingRouter = Router();
bookingRouter.use(authenticateToken);
bookingRouter.get('/', getBooking);
bookingRouter.post('/', validateBody(bookingSchema), createBooking);

export { bookingRouter };
