import * as crypto from 'node:crypto';

export const createHash = (password: string): string => {
  const algorithm = process.env.HASH_ALGORITHM;
  const localSalt = process.env.LOCAL_SALT;
  const iterations = Number(process.env.ITERATIONS);
  const keylen = Number(process.env.KEYLEN);

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
