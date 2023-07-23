import { notFoundError, unauthorizedError } from '@/errors';
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
    throw unauthorizedError();
  }

  const roomWithBookingCount = await bookingRepository.getRoomWithBookingCount(roomId);
  if (!roomWithBookingCount) {
    throw notFoundError();
  }
  if (roomWithBookingCount.capacity <= roomWithBookingCount.bookingCount) {
    throw unauthorizedError();
  }

  const booking = await bookingRepository.createBooking(userId, roomId);
  return booking.id;
}

const bookingService = {
  getBooking,
  createBooking,
};

export default bookingService;
