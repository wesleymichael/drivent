import Joi from 'joi';

type RoomId = { roomId: number };

export const bookingSchema = Joi.object<RoomId>({
  roomId: Joi.number().required(),
});
