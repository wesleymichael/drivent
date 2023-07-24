import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createBooking,
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

describe('Get /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when the reservation is found', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and with booking data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoom(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const { status, body } = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.OK);
      expect(body).toEqual({
        id: booking.id,
        Room: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: hotel.id,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      });
    });
  });
});

describe('Post /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when there are no body or invalid body', async () => {
      const token = await generateValidToken();

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send();
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 when there are no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when the ticket is not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);

      const isRemote = false;
      const includesHotel = true;
      const ticketType = await createTicketType(isRemote, includesHotel);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    describe('when ticket is paid', () => {
      it('should respond with status 403 when event is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = true;
        const ticketType = await createTicketType(isRemote);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('should respond with status 403 when not including hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = false;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('should respond with status 404 when there is no room', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it('should respond with status 403 when there is no vacancy', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const hotel = await createHotel();
        const roomCapacity = 1;
        const room = await createRoom(hotel.id, roomCapacity);
        await createBooking(user.id, room.id);

        const response = await server
          .post('/booking')
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: room.id });

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('should respond with status 200 and bookingId when post is successful', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);

        const isRemote = false;
        const includesHotel = true;
        const ticketType = await createTicketType(isRemote, includesHotel);
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const hotel = await createHotel();
        const room = await createRoom(hotel.id);

        const { status, body } = await server
          .post('/booking')
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: room.id });
        expect(status).toBe(httpStatus.OK);
        expect(body).toEqual({ bookingId: expect.any(Number) });
      });
    });
  });
});

describe('Put /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when there is no body or invalid body', async () => {
      const token = await generateValidToken();

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send();
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when invalid params', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      //await createEnrollmentWithAddress(user);

      const bookingId = 'string';

      const response = await server
        .put(`/booking/${bookingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: 1 });
      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe('when token, params, end body is valid', () => {
      it('should respond with status 403 when booking not exist', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('should respond with status 404 when there is no room', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoom(hotel.id);
        await createBooking(user.id, room.id);

        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it('should respond with status 403 when there is no vacancy', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const hotel = await createHotel();
        const roomCapacity = 1;
        const room = await createRoom(hotel.id, roomCapacity);
        await createBooking(user.id, room.id);

        const response = await server
          .put('/booking/1')
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: room.id });

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('should respond with status 200 and bookingId when put is successful', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);

        const hotel = await createHotel();
        const room = await createRoom(hotel.id);
        const booking = await createBooking(user.id, room.id);

        const { status, body } = await server
          .put(`/booking/${booking.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ roomId: room.id });
        expect(status).toBe(httpStatus.OK);
        expect(body).toEqual({ bookingId: expect.any(Number) });
      });
    });
  });
});
