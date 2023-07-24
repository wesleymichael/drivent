import { forbiddenError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketRepository from '@/repositories/ticket-repository';

async function getBooking(userId: number) {
  const booking = await bookingRepository.getBooking(userId);
  if (!booking) {
    throw notFoundError();
  }
  return booking;
}

async function createBooking(userId: number, roomId: number) {
  const result = await enrollmentRepository.findEnrollmentAndTicketByUserId(userId);

  const ticket = result?.Ticket[0];
  if (!result || !ticket) {
    throw notFoundError();
  }

  const ticketType = await ticketRepository.getTicketType(ticket.ticketTypeId);
  if (ticket.status !== 'PAID' || ticketType.isRemote === true || ticketType.includesHotel === false) {
    throw forbiddenError();
  }

  const roomWithBookingCount = await bookingRepository.getRoomWithBookingCount(roomId);
  if (!roomWithBookingCount) {
    throw notFoundError();
  }
  if (roomWithBookingCount.capacity <= roomWithBookingCount.bookingCount) {
    throw forbiddenError();
  }

  const booking = await bookingRepository.createBooking(userId, roomId);
  return booking.id;
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
  const booking = await bookingRepository.getBooking(userId);
  if (!booking) {
    throw forbiddenError();
  }

  const roomWithBookingCount = await bookingRepository.getRoomWithBookingCount(roomId);
  if (!roomWithBookingCount) {
    throw notFoundError();
  }
  if (roomWithBookingCount.capacity <= roomWithBookingCount.bookingCount) {
    throw forbiddenError();
  }

  const resultBookingUpdate = await bookingRepository.updateBooking(bookingId, roomId);
  return resultBookingUpdate.id;
}

const bookingService = {
  getBooking,
  createBooking,
  updateBooking,
};

export default bookingService;
