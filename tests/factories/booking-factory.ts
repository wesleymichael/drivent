import faker from '@faker-js/faker';

export function createRoomMock() {
  return {
    id: faker.datatype.number(),
    name: faker.name.firstName(),
    capacity: faker.datatype.number({ max: 6 }),
    hotelId: faker.datatype.number(),
  };
}
