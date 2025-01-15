import winston from 'winston';
import { getAuthorizationObject, getUserAndPassFromBasicAuth } from '@tupaia/auth';
import { respond, reduceToDictionary } from '@tupaia/utils';
import { ConsecutiveFailsRateLimiter } from './ConsecutiveFailsRateLimiter';
import { BruteForceRateLimiter } from './BruteForceRateLimiter';
import { allowNoPermissions } from '../../permissions';
import { checkUserLocationAccess } from './checkUserLocationAccess';
import { respondToRateLimitedUser } from './respondToRateLimitedUser';

const GRANT_TYPES = {
  PASSWORD: 'password',
  REFRESH_TOKEN: 'refresh_token',
  ONE_TIME_LOGIN: 'one_time_login',
};

// Get the permission group ids for each country the user has access to
// This is to support legacy meditrak app versions 1.7.81 (oldest supported) and 1.7.85 (only other
// app released before the (now also legacy) access policy was introduced in 1.7.86)
const extractPermissionGroupsIfLegacy = async (models, accessPolicy) => {
  // legacy policies look like
  // { permissions: { surveys: { _items: { VU: { _access: { Donor: true } } } } } }
  const isLegacyPolicy = !!accessPolicy.permissions;
  if (!isLegacyPolicy) return null;
  // legacy meditrak-app dealt with the permissions for surveys
  const surveyPermissions = accessPolicy.permissions.surveys._items; // eslint-disable-line no-underscore-dangle
  const countryCodes = Object.keys(surveyPermissions);
  const countries = await models.country.find({ code: countryCodes });
  const countryIdByCode = reduceToDictionary(countries, 'code', 'id');
  const permissionGroupsByCountryId = {};
  await Promise.all(
    Object.entries(surveyPermissions).map(async ([countryCode, { _access: access }]) => {
      const countryId = countryIdByCode[countryCode];
      const permissionGroupNames = Object.keys(access).filter(p => access[p]);
      const permissionGroupIds = (
        await models.permissionGroup.find({ name: permissionGroupNames })
      ).map(p => p.id);
      permissionGroupsByCountryId[countryId] = permissionGroupIds;
    }),
  );
  return permissionGroupsByCountryId;
};

/**
 * Check whether this is a meditrak app login, or some other client (e.g. admin panel, mSupply).
 * N.B. this relies on `installId` being present, which was introduced in app version 1.7.81.
 * Because of this we have officially deprecated support for any earlier versions of meditrak-app
 * @param {Object} body The request body from the POST to /auth
 */
function isMeditrakLogin(body) {
  return body && body.installId;
}

const getMeditrakDeviceDetails = req => {
  const { body, query } = req;
  if (!isMeditrakLogin(body)) {
    return null;
  }
  const { devicePlatform: platform, installId } = body || {};
  const { appVersion } = query;

  return {
    installId,
    platform,
    appVersion,
  };
};

const checkUserAuthentication = async req => {
  const { body, query, authenticator } = req;
  switch (query.grantType) {
    case GRANT_TYPES.REFRESH_TOKEN:
      return authenticator.authenticateRefreshToken(body);
    case GRANT_TYPES.ONE_TIME_LOGIN:
      return authenticator.authenticateOneTimeLogin(body);
    case GRANT_TYPES.PASSWORD:
    default: {
      const meditrakDeviceDetails = getMeditrakDeviceDetails(req);
      return authenticator.authenticatePassword(body, meditrakDeviceDetails);
    }
  }
};

const checkApiClientAuthentication = async req => {
  const { headers, authenticator } = req;
  const { username, password: secretKey } = getUserAndPassFromBasicAuth(headers.authorization);

  if (!username) {
    return {};
  }

  try {
    return await authenticator.authenticateApiClient({ username, secretKey });
  } catch (error) {
    winston.warn('Invalid Api Client Basic Auth header provided');
    return {};
  }
};

/**
 * Handler for a POST to the /auth endpoint
 * By default, or if URL parameters include grantType=password, will check the email address and
 * password supplied in the POST body against a user in the database, and if valid, return JSON
 * including a JWT token that can be used for accessing the API, and a refresh token for when that
 * expires.
 * If URL parameters include grantType=refreshToken, will check the refreshToken against the database
 * and if valid, returns a new JWT token that can be used for accessing the API
 * Override grants to do recursive authentication, for example when creating a new user.
 */
export async function authenticate(req, res) {
  await req.assertPermissions(allowNoPermissions);
  const { grantType } = req.query;
  const consecutiveFailsRateLimiter = new ConsecutiveFailsRateLimiter(req.database);
  const bruteForceRateLimiter = new BruteForceRateLimiter(req.database);

  if (await bruteForceRateLimiter.checkIsRateLimited(req)) {
    const msBeforeNext = await bruteForceRateLimiter.getRetryAfter(req);
    return respondToRateLimitedUser(msBeforeNext, res);
  }

  if (await consecutiveFailsRateLimiter.checkIsRateLimited(req)) {
    const msBeforeNext = await consecutiveFailsRateLimiter.getRetryAfter(req);
    return respondToRateLimitedUser(msBeforeNext, res);
  }

  // Check if the user is authorised
  try {
    const { refreshToken, user, accessPolicy } = await checkUserAuthentication(req);
    const { user: apiClientUser } = await checkApiClientAuthentication(req);
    const permissionGroupsByCountryId = await extractPermissionGroupsIfLegacy(
      req.models,
      accessPolicy,
    );

    const authorizationObject = await getAuthorizationObject({
      refreshToken,
      user,
      accessPolicy,
      apiClientUser,
      permissionGroups: permissionGroupsByCountryId,
    });

    await checkUserLocationAccess(req, user);

    // Reset rate limiting on successful authorisation
    await consecutiveFailsRateLimiter.resetFailedAttempts(req);
    await bruteForceRateLimiter.resetFailedAttempts(req);

    respond(res, authorizationObject, 200);
  } catch (authError) {
    if (authError.statusCode === 401) {
      // Record failed login attempt to rate limiter
      await bruteForceRateLimiter.addFailedAttempt(req);
      if (grantType === GRANT_TYPES.PASSWORD || grantType === undefined) {
        await consecutiveFailsRateLimiter.addFailedAttempt(req);
      }
    }

    throw authError;
  }
}
