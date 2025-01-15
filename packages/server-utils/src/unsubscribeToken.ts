import { requireEnv } from '@tupaia/utils';
import sha256 from 'sha256';

export const generateUnsubscribeToken = (email: string) => {
  const secretKey = requireEnv('UNSUBSCRIBE_TOKEN_SECRET');
  return sha256(`${email}${secretKey}`);
};

export const verifyUnsubscribeToken = (token: string, email: string) => {
  if (generateUnsubscribeToken(email) === token) {
    return true;
  }

  throw new Error(`Invalid unsubscribe token for email: ${email}`);
};
