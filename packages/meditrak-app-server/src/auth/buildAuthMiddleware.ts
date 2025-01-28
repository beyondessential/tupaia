import { AccessPolicy } from '@tupaia/access-policy';
import { Authenticator, getJwtToken } from '@tupaia/auth';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { NextFunction, Request, Response } from 'express';

export const buildAuthMiddleware = (database: TupaiaDatabase) => {
  const models = new ModelRegistry(database);
  const authenticator = new Authenticator(models);

  return async (req: Request, res: Response, next: NextFunction) => {
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
