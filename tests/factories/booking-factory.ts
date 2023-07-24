import faker from '@faker-js/faker';
import { prisma } from '@/config';

export function createRoomMock() {
  return {
    id: faker.datatype.number(),
    name: faker.name.firstName(),
    capacity: faker.datatype.number({ min: 2, max: 6 }),
    hotelId: faker.datatype.number(),
  };
}

export function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

export function createRoomWithBookingCountMock(capacity?: number, bookingCount?: number) {
  return {
    id: faker.datatype.number(),
    capacity: capacity ?? faker.datatype.number({ min: 2, max: 6 }),
    bookingCount: bookingCount ?? 0,
  };
}

export function createBookingMock() {
  return {
    id: faker.datatype.number(),
  };
}
