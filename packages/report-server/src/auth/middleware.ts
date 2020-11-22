import { UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { ReportsRequest } from '../types';

export const authenticationMiddleware = async (req: ReportsRequest, res, next) => {
  try {
    const { body, authenticator } = req;
    const { emailAddress, password } = body;
    const { user, accessPolicy } = await authenticator.authenticatePassword({
      emailAddress,
      password,
      deviceName: 'reports',
    });
    if (user) {
      req.accessPolicy = new AccessPolicy(accessPolicy);
    } else {
      throw new UnauthenticatedError('Could not find user');
    }
    next();
  } catch (error) {
    next(error);
  }
};
