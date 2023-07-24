import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { createBooking, getBooking, updateBooking } from '@/controllers/booking-controller';
import { bookingSchema } from '@/schemas/booking-schemas';

const bookingRouter = Router();
bookingRouter
  .use(authenticateToken)
  .get('/', getBooking)
  .post('/', validateBody(bookingSchema), createBooking)
  .put('/:bookingId', validateBody(bookingSchema), updateBooking);

export { bookingRouter };
