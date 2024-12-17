import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CRYPT_SALT } from 'src/common/config';

export const setHashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(Number.parseInt(CRYPT_SALT));
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  oldPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, oldPassword);
};

export const notFound = (what: string, id: string) => {
  throw new NotFoundException(
    `The ${what} with the id of '${id}' was not found`,
  );
};

export const forbidden = (msg = `Access forbidden`) => {
  throw new ForbiddenException(msg);
};

export const unprocessable = (msg = `Unprocessable item`) => {
  throw new UnprocessableEntityException(msg);
};
