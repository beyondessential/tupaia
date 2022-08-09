import { BasicAuthHandler } from '@tupaia/api-client';

const { MICROSERVICE_CLIENT_USERNAME, MICROSERVICE_CLIENT_SECRET } = process.env;

export const authHandlerProvider = req => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    return new ForwardingAuthHandler(authHeader);
  }

  return new BasicAuthHandler(MICROSERVICE_CLIENT_USERNAME, MICROSERVICE_CLIENT_SECRET);
};
