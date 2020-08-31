import { UnauthenticatedError } from '@tupaia/utils';
import { AccessPolicy } from '@tupaia/access-policy';
import { getUserIDFromToken } from './userAuth';
import { getAPIClientUser } from './clientAuth';

async function authenticateUser(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    throw new UnauthenticatedError('No authorization header provided - must be Basic or Bearer');
  }

  const preAuthenticationRoutes = [
    '/auth',
    '/auth/resetPassword',
    '/user',
    '/auth/verifyEmail',
    '/auth/resendEmail',
  ];
  const tokenUserID = authHeader.startsWith('Bearer') && getUserIDFromToken(authHeader);

  // Use the user account provided in the auth header if present
  if (tokenUserID) {
    return tokenUserID;
  }

  // If no user specified otherwise, use the one linked to api client (if present)
  // If the client is *invalid*, this will throw -- anything after here has a valid client
  // (whether there's a user attached or not)
  const apiClientUser = await getAPIClientUser(authHeader, req.models);
  if (apiClientUser) {
    return apiClientUser.id;
  }

  // Non-user requests are only allowed access to these routes
  if (preAuthenticationRoutes.includes(req.endpoint)) {
    return null;
  }

  // There's no user account provided and it's not a pre-auth route
  // They _are_ using a valid client, but, too bad.
  throw new UnauthenticatedError('This route is only available to logged-in users');
}

export const authenticationMiddleware = async (req, res, next) => {
  try {
    const userId = await authenticateUser(req);
    if (userId) {
      req.userId = userId;
      const { authenticator } = req;
      const accessPolicy = await authenticator.getAccessPolicyForUser(userId);
      req.accessPolicy = new AccessPolicy(accessPolicy);
    }
    next();
  } catch (error) {
    next(error);
  }
};
