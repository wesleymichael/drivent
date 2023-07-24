/* eslint-disable @typescript-eslint/no-explicit-any */
import faker from '@faker-js/faker';
import {
  createEnrollmentWithTicketMock,
  createRoomMock,
  createTicketTypeMock,
  createRoomWithBookingCountMock,
  createBookingMock,
} from '../factories';
import bookingService from '@/services/booking-service';
import bookingRepository from '@/repositories/booking-repository';
import { forbiddenError, notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketRepository from '@/repositories/ticket-repository';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Get booking', () => {
  it('should return reservation when found', async () => {
    const bookingId = faker.datatype.number();
    const userId = faker.datatype.number();
    const room = createRoomMock();
    jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce((): any => {
      return {
        id: bookingId,
        room,
      };
    });
    const result = await bookingService.getBooking(userId);
    expect(bookingRepository.getBooking).toHaveBeenCalledWith(userId);
    expect(result).toEqual({
      id: bookingId,
      room,
    });
  });

  it('should throw a not found error when the reservation is not found', async () => {
    const userId = faker.datatype.number();
    jest.spyOn(bookingRepository, 'getBooking').mockResolvedValueOnce(null);

    const result = bookingService.getBooking(userId);
    await expect(result).rejects.toEqual(notFoundError());
    expect(bookingRepository.getBooking).toBeCalledTimes(1);
  });
});

describe('Post booking', () => {
  it('should throw a not found error when there is no ticket', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();

    jest.spyOn(enrollmentRepository, 'findEnrollmentAndTicketByUserId').mockResolvedValueOnce(null);

    const result = bookingService.createBooking(userId, roomId);
    await expect(result).rejects.toEqual(notFoundError());
    expect(enrollmentRepository.findEnrollmentAndTicketByUserId).toBeCalledTimes(1);
  });

  it('should throw forbidden Error when ticket not paid', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const enrollmentWithTicketMock = createEnrollmentWithTicketMock();
    const ticketTypeMock = createTicketTypeMock();

    jest.spyOn(enrollmentRepository, 'findEnrollmentAndTicketByUserId').mockImplementationOnce((): any => {
      return enrollmentWithTicketMock;
    });

    jest.spyOn(ticketRepository, 'getTicketType').mockImplementationOnce((): any => {
      return ticketTypeMock;
    });
    const result = bookingService.createBooking(userId, roomId);
    await expect(result).rejects.toEqual(forbiddenError());
    expect(enrollmentRepository.findEnrollmentAndTicketByUserId).toBeCalledTimes(1);
    expect(ticketRepository.getTicketType).toBeCalledTimes(1);
  });

  it('should throw forbidden Error when ticket is remote', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const enrollmentWithTicketMock = createEnrollmentWithTicketMock('PAID');
    const isRemote = true;
    const ticketTypeMock = createTicketTypeMock(isRemote);

    jest.spyOn(enrollmentRepository, 'findEnrollmentAndTicketByUserId').mockImplementationOnce((): any => {
      return enrollmentWithTicketMock;
    });

    jest.spyOn(ticketRepository, 'getTicketType').mockImplementationOnce((): any => {
      return ticketTypeMock;
    });
    const result = bookingService.createBooking(userId, roomId);
    await expect(result).rejects.toEqual(forbiddenError());
    expect(enrollmentRepository.findEnrollmentAndTicketByUserId).toBeCalledTimes(1);
    expect(ticketRepository.getTicketType).toBeCalledTimes(1);
  });

  it('should throw forbidden error when ticket does not include hotel', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const enrollmentWithTicketMock = createEnrollmentWithTicketMock('PAID');
    const isRemote = false;
    const includesHotel = false;
    const ticketTypeMock = createTicketTypeMock(isRemote, includesHotel);

    jest.spyOn(enrollmentRepository, 'findEnrollmentAndTicketByUserId').mockImplementationOnce((): any => {
      return enrollmentWithTicketMock;
    });

    jest.spyOn(ticketRepository, 'getTicketType').mockImplementationOnce((): any => {
      return ticketTypeMock;
    });
    const result = bookingService.createBooking(userId, roomId);
    await expect(result).rejects.toEqual(forbiddenError());
    expect(enrollmentRepository.findEnrollmentAndTicketByUserId).toBeCalledTimes(1);
    expect(ticketRepository.getTicketType).toBeCalledTimes(1);
  });

  it('should throw bad resquest error when there is no room', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const enrollmentWithTicketMock = createEnrollmentWithTicketMock('PAID');
    const isRemote = false;
    const includesHotel = true;
    const ticketTypeMock = createTicketTypeMock(isRemote, includesHotel);

    jest.spyOn(enrollmentRepository, 'findEnrollmentAndTicketByUserId').mockImplementationOnce((): any => {
      return enrollmentWithTicketMock;
    });

    jest.spyOn(ticketRepository, 'getTicketType').mockImplementationOnce((): any => {
      return ticketTypeMock;
    });

    jest.spyOn(bookingRepository, 'getRoomWithBookingCount').mockResolvedValueOnce(null);

    const result = bookingService.createBooking(userId, roomId);
    await expect(result).rejects.toEqual(notFoundError());
    expect(enrollmentRepository.findEnrollmentAndTicketByUserId).toBeCalledTimes(1);
    expect(ticketRepository.getTicketType).toBeCalledTimes(1);
    expect(bookingRepository.getRoomWithBookingCount).toBeCalledTimes(1);
  });

  it('should throw forbidden error when there is no vacancy', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const enrollmentWithTicketMock = createEnrollmentWithTicketMock('PAID');
    const isRemote = false;
    const includesHotel = true;
    const ticketTypeMock = createTicketTypeMock(isRemote, includesHotel);
    const capacity = 4;
    const bookingCount = 4;
    const roomWithBookingCountMock = createRoomWithBookingCountMock(capacity, bookingCount);

    jest.spyOn(enrollmentRepository, 'findEnrollmentAndTicketByUserId').mockImplementationOnce((): any => {
      return enrollmentWithTicketMock;
    });

    jest.spyOn(ticketRepository, 'getTicketType').mockImplementationOnce((): any => {
      return ticketTypeMock;
    });

    jest.spyOn(bookingRepository, 'getRoomWithBookingCount').mockImplementationOnce((): any => {
      return roomWithBookingCountMock;
    });

    const result = bookingService.createBooking(userId, roomId);
    await expect(result).rejects.toEqual(forbiddenError());
    expect(enrollmentRepository.findEnrollmentAndTicketByUserId).toBeCalledTimes(1);
    expect(ticketRepository.getTicketType).toBeCalledTimes(1);
    expect(bookingRepository.getRoomWithBookingCount).toBeCalledTimes(1);
  });

  it('should return a booking when post is successful', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const enrollmentWithTicketMock = createEnrollmentWithTicketMock('PAID');
    const isRemote = false;
    const includesHotel = true;
    const ticketTypeMock = createTicketTypeMock(isRemote, includesHotel);
    const roomWithBookingCountMock = createRoomWithBookingCountMock();
    const bookingMock = createBookingMock();

    jest.spyOn(enrollmentRepository, 'findEnrollmentAndTicketByUserId').mockImplementationOnce((): any => {
      return enrollmentWithTicketMock;
    });

    jest.spyOn(ticketRepository, 'getTicketType').mockImplementationOnce((): any => {
      return ticketTypeMock;
    });

    jest.spyOn(bookingRepository, 'getRoomWithBookingCount').mockImplementationOnce((): any => {
      return roomWithBookingCountMock;
    });

    jest.spyOn(bookingRepository, 'createBooking').mockImplementationOnce((): any => {
      return bookingMock;
    });

    const result = await bookingService.createBooking(userId, roomId);
    expect(result).toEqual(bookingMock.id);
    expect(enrollmentRepository.findEnrollmentAndTicketByUserId).toBeCalledTimes(1);
    expect(ticketRepository.getTicketType).toBeCalledTimes(1);
    expect(bookingRepository.getRoomWithBookingCount).toBeCalledTimes(1);
    expect(bookingRepository.createBooking).toBeCalledTimes(1);
  });
});

describe('Put booking', () => {
  it('should throw a forbidden error when booking not exist', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const booking = createBookingMock();

    jest.spyOn(bookingRepository, 'getBooking').mockResolvedValueOnce(null);

    const result = bookingService.updateBooking(userId, roomId, booking.id);
    await expect(result).rejects.toEqual(forbiddenError());
    expect(bookingRepository.getBooking).toBeCalledTimes(1);
  });

  it('should throw not found error when there is no room', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const booking = createBookingMock();

    jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce((): any => {
      return booking;
    });

    jest.spyOn(bookingRepository, 'getRoomWithBookingCount').mockResolvedValueOnce(null);

    const result = bookingService.updateBooking(userId, roomId, booking.id);
    await expect(result).rejects.toEqual(notFoundError());
    expect(bookingRepository.getBooking).toBeCalledTimes(1);
    expect(bookingRepository.getRoomWithBookingCount).toBeCalledTimes(1);
  });

  it('should throw forbidden error when there is no vacancy', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const booking = createBookingMock();
    const capacity = 4;
    const bookingCount = 4;
    const roomWithBookingCountMock = createRoomWithBookingCountMock(capacity, bookingCount);

    jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce((): any => {
      return booking;
    });

    jest.spyOn(bookingRepository, 'getRoomWithBookingCount').mockImplementationOnce((): any => {
      return roomWithBookingCountMock;
    });

    const result = bookingService.updateBooking(userId, roomId, booking.id);
    await expect(result).rejects.toEqual(forbiddenError());
    expect(bookingRepository.getBooking).toBeCalledTimes(1);
    expect(bookingRepository.getRoomWithBookingCount).toBeCalledTimes(1);
  });

  it('should return a booking when post is successful', async () => {
    const userId = faker.datatype.number();
    const roomId = faker.datatype.number();
    const booking = createBookingMock();

    const roomWithBookingCountMock = createRoomWithBookingCountMock();

    jest.spyOn(bookingRepository, 'getBooking').mockImplementationOnce((): any => {
      return booking;
    });

    jest.spyOn(bookingRepository, 'getRoomWithBookingCount').mockImplementationOnce((): any => {
      return roomWithBookingCountMock;
    });

    jest.spyOn(bookingRepository, 'updateBooking').mockImplementationOnce((): any => {
      return booking;
    });

    const result = await bookingService.updateBooking(userId, roomId, booking.id);

    expect(result).toEqual(booking.id);
    expect(bookingRepository.updateBooking).toBeCalledTimes(1);
    expect(bookingRepository.getBooking).toBeCalledTimes(1);
    expect(bookingRepository.getRoomWithBookingCount).toBeCalledTimes(1);
  });
});
