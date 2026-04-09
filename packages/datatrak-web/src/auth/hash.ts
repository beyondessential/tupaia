import { argon2id, argon2Verify } from 'hash-wasm';

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const hash = await argon2id({
    password: password,
    salt: salt,
    parallelism: 1,
    iterations: 2,
    memorySize: 19456,
    hashLength: 32,
    outputType: 'encoded',
  });

  return hash;
}

export async function verifyPassword(storedHash: string, passwordAttempt: string) {
  const isValid = await argon2Verify({
    password: passwordAttempt,
    hash: storedHash,
  });

  return isValid;
}
