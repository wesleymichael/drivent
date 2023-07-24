import { prisma } from '@/config';

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

const roomRepository = {
  getRoomWithBookingCount,
};

export default roomRepository;
