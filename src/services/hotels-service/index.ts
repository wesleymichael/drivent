import { Hotel } from '@prisma/client';
import hotelRepository from '@/repositories/hotel-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { notFoundError, paymentRequired } from '@/errors';
import ticketRepository from '@/repositories/ticket-repository';

async function getHotels(userId: number): Promise<Hotel[]> {
  const result = await enrollmentRepository.findEnrollmentAndTicketByUserId(userId);
  const ticket = result.Ticket[0];
  if (!result.id || !ticket) {
    throw notFoundError();
  }

  const ticketType = await ticketRepository.getTicketType(ticket.ticketTypeId);
  if (ticket.status !== 'PAID' || ticketType.isRemote === true || ticketType.includesHotel === false) {
    throw paymentRequired();
  }

  const hotels = await hotelRepository.findHotels();
  if (hotels.length === 0) {
    throw notFoundError();
  }
  return hotels;
}

const hotelService = {
  getHotels,
};

export default hotelService;
