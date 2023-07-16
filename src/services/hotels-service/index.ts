import { Hotel } from '@prisma/client';
import hotelRepository from '@/repositories/hotel-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { notFoundError, paymentRequired, unsentData } from '@/errors';
import ticketRepository from '@/repositories/ticket-repository';
import { HotelWithRooms } from '@/protocols';

async function rulesValidation(userId: number) {
  const result = await enrollmentRepository.findEnrollmentAndTicketByUserId(userId);

  const ticket = result?.Ticket[0];
  if (!result || !ticket) {
    throw notFoundError();
  }

  const ticketType = await ticketRepository.getTicketType(ticket.ticketTypeId);
  if (ticket.status !== 'PAID' || ticketType.isRemote === true || ticketType.includesHotel === false) {
    throw paymentRequired();
  }
}

async function getHotels(userId: number): Promise<Hotel[]> {
  rulesValidation(userId);
  const hotels = await hotelRepository.findHotels();
  if (hotels.length === 0) {
    throw notFoundError();
  }
  return hotels;
}

async function getRoomsByHotelId(userId: number, hotelId: number): Promise<HotelWithRooms> {
  if (!hotelId) {
    throw unsentData('Unsent hotelId');
  }

  rulesValidation(userId);

  const hotelWithRooms = await hotelRepository.findRoomsByHotelId(hotelId);
  if (!hotelWithRooms) {
    throw notFoundError();
  }
  return hotelWithRooms;
}

const hotelService = {
  getHotels,
  getRoomsByHotelId,
};

export default hotelService;
