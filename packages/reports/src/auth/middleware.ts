import { UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';

export const authenticationMiddleware = async (req, res, next) => {
  try {
    const { body, authenticator } = req;
    const { user, accessPolicy } = await authenticator.authenticatePassword(body);
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
