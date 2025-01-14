import { BasicAuthHandler, ForwardingAuthHandler } from '@tupaia/api-client';
import { requireEnv } from '@tupaia/utils';
import { Request } from 'express';

export const authHandlerProvider = (req: Request) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    return new ForwardingAuthHandler(authHeader);
  }

  return new BasicAuthHandler(requireEnv('API_CLIENT_NAME'), requireEnv('API_CLIENT_PASSWORD'));
};
