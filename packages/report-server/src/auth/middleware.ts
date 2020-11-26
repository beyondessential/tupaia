import { UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { getUserIDFromToken } from '@tupaia/auth';
import { ReportsRequest } from '../types';

const authenticateUser = async (req: ReportsRequest) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    throw new UnauthenticatedError('No authorization header provided - must be Bearer Auth Header');
  }

  // Use the user account provided in the auth header if present
  const tokenUserID = authHeader.startsWith('Bearer') && getUserIDFromToken(authHeader);
  if (tokenUserID) {
    return tokenUserID;
  }

  throw new UnauthenticatedError('Could not authenticate with the provided token');
}

export const authenticationMiddleware = async (req: ReportsRequest, res, next) => {
  try {
    const userId = await authenticateUser(req);
    if (userId) {
      const { authenticator } = req;
      const accessPolicy = await authenticator.getAccessPolicyForUser(userId);
      req.accessPolicy = new AccessPolicy(accessPolicy);
    }
    next();
  } catch (error) {
    next(error);
  }
};
