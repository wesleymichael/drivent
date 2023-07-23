import { createRoomMock } from '../factories';
import bookingService from '@/services/booking-service';
import bookingRepository from '@/repositories/booking-repository';
import { notFoundError } from '@/errors';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Get booking', () => {
  it('should return reservation when found', async () => {
    const bookingId = 1;
    const userId = 1;
    const room = createRoomMock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const userId = 1;
    jest.spyOn(bookingRepository, 'getBooking').mockResolvedValueOnce(null);
    const result = bookingService.getBooking(userId);
    expect(result).rejects.toEqual(notFoundError());
    expect(bookingRepository.getBooking).toBeCalledTimes(1);
  });
});
