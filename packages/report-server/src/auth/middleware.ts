import { UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { getUserIDFromToken } from '@tupaia/auth';
import { ReportsRequest } from '../types';

const authenticateUser = async (req: ReportsRequest) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    throw new UnauthenticatedError('No authorization header provided - must be Bearer Auth Header');
  }

  if (authHeader.startsWith('Bearer')) {
    return authenticateBearerAuthHeader(authHeader);
  } else if (authHeader.startsWith('Basic')) {
    return authenticateBasicAuthHeader(req, authHeader);
  }

  throw new UnauthenticatedError('Could not authenticate with the provided token');
}

const authenticateBearerAuthHeader = async (authHeader: string) => {
  // Use the user account provided in the auth header if present
  const tokenUserID = getUserIDFromToken(authHeader);
  if (tokenUserID) {
    return tokenUserID;
  }

  throw new UnauthenticatedError('Could not authenticate with the provided access token');
}

const authenticateBasicAuthHeader = async (req: ReportsRequest, authHeader: string) => {
  const usernamePassword = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
  if (!usernamePassword.includes(':')) {
    throw new UnauthenticatedError('Invalid Basic auth credentials');
  }

  //Split on first occurrence because password can contain ':'
  const username = usernamePassword.split(':')[0];
  const password = usernamePassword.substring(username.length + 1, usernamePassword.length);
  const { authenticator } = req;
  const { user } = await authenticator.authenticatePassword({
    emailAddress: username,
    password,
    deviceName: 'reports',
  });
  if (user) {
    return user.id;
  } 
    
  throw new UnauthenticatedError('Could not find user');
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
