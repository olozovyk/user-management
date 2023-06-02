import * as crypto from 'node:crypto';

interface ICreateHash {
  password: string;
  algorithm: string;
  localSalt: string;
  iterations: number;
  keylen: number;
}

export const createHash = ({
  password,
  algorithm,
  localSalt,
  iterations,
  keylen,
}: ICreateHash): string => {
  const remoteSalt = crypto
    .createHash(algorithm)
    .update(password)
    .digest('hex');

  const salt = localSalt + remoteSalt;

  const hashToPassword = crypto
    .pbkdf2Sync(password, salt, iterations, keylen, algorithm)
    .toString('hex');
  return hashToPassword + remoteSalt;
};
