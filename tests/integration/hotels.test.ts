import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createHotel,
  createRoom,
  createTicket,
  createTicketType,
  createUser,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('Get /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when there are no enrollment', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when there are no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when the ticket is not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe('when ticket is paid', () => {
      it('should respond with status 402 when event is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = true;
        const ticketType = await createTicketType(isRemote);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 402 when not including hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = false;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 404 when there are no hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it('should respond with status 200 and with hotels data', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        await createHotel();
        await createHotel();
        await createHotel();
        await createHotel();

        const { status, body } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(status).toBe(httpStatus.OK);
        expect(body).toHaveLength(4);
        expect(body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
              image: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          ]),
        );
      });
    });
  });
});

describe('Get /hotels /:hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels/1');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 if param hotelId is invalid', async () => {
      const token = await generateValidToken();

      const response = await server.get(`/hotels/a`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 when there are no enrollment', async () => {
      const token = await generateValidToken();

      const response = await server.get(`/hotels/1`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when there are no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get(`/hotels/1`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when the ticket is not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get(`/hotels/1`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    describe('when ticket is paid', () => {
      it('should respond with status 402 when event is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = true;
        const ticketType = await createTicketType(isRemote);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get(`/hotels/1`).set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 402 when not including hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = false;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 404 when there are no hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it('should respond with status 200 and with hotel rooms details', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const hotel = await createHotel();
        await createRoom(hotel.id);

        const { status, body } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

        expect(status).toBe(httpStatus.OK);
        expect(body).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            Rooms: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                capacity: expect.any(Number),
                hotelId: expect.any(Number),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              }),
            ]),
          }),
        );
      });
    });
  });
});
