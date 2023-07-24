import { prisma } from '@/config';

async function getBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function getRoomWithBookingCount(roomId: number) {
  const room = await prisma.room.findUnique({
    where: {
      id: roomId,
    },
    select: {
      id: true,
      capacity: true,
    },
  });

  const bookingCount = await prisma.booking.count({
    where: {
      roomId: roomId,
    },
  });

  if (!room) {
    return null;
  }
  return {
    ...room,
    bookingCount: bookingCount,
  };
}

async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}

const bookingRepository = {
  getBooking,
  getRoomWithBookingCount,
  createBooking,
};

export default bookingRepository;
