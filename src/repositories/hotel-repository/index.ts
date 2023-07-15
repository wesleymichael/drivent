import { prisma } from '@/config';

async function findHotels() {
  return await prisma.hotel.findMany();
}

const hotelRepository = {
  findHotels,
};

export default hotelRepository;
