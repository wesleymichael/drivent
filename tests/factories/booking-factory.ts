import faker from '@faker-js/faker';
import { prisma } from '@/config';

export function createRoomMock() {
  return {
    id: faker.datatype.number(),
    name: faker.name.firstName(),
    capacity: faker.datatype.number({ max: 6 }),
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
