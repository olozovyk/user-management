import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export const validateEntity = async (entity: object) => {
  const errors = await validate(entity);

  if (errors.length > 0) {
    const message =
      JSON.stringify(errors[0].constraints) || 'Validation failed!';
    throw new BadRequestException(message);
  }
};
