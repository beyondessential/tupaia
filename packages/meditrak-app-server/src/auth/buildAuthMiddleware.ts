import { RequestHandler } from 'express';
import { AccessPolicy } from '@tupaia/access-policy';
import { Authenticator, getJwtToken } from '@tupaia/auth';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';

export const buildAuthMiddleware = (database: TupaiaDatabase): RequestHandler => {
  const models = new ModelRegistry(database);
  const authenticator = new Authenticator(models);

  return async (req, _res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Error('Authorization header required');
      }

      const accessToken = getJwtToken(authHeader);
      const { user, accessPolicy } = await authenticator.authenticateAccessToken(accessToken);
      req.user = user;
      req.accessPolicy = new AccessPolicy(accessPolicy);
      next();
    } catch (err) {
      next(err);
    }
  };
};
