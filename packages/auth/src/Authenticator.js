import randomToken from 'rand-token';
import compareVersions from 'semver-compare';

import { DatabaseError, UnauthenticatedError, UnverifiedError } from '@tupaia/utils';
import { AccessPolicyBuilder } from './AccessPolicyBuilder';
import { mergeAccessPolicies } from './mergeAccessPolicies';
import { getTokenClaims } from './userAuth';

const REFRESH_TOKEN_LENGTH = 40;
const MAX_MEDITRAK_USING_LEGACY_POLICY = '1.7.106';

export class Authenticator {
  constructor(models, AccessPolicyBuilderClass = AccessPolicyBuilder) {
    this.models = models;
    this.accessPolicyBuilder = new AccessPolicyBuilderClass(models);
  }

  /**
   * Authenticate by access token string
   * @param {string} accessToken
   */
  async authenticateAccessToken(accessToken) {
    const { userId, apiClientUserId } = getTokenClaims(accessToken); // will throw if access token expired or invalid

    if (!userId) {
      throw new UnauthenticatedError('Could not authenticate access token');
    }

    const user = await this.models.user.findById(userId);
    const userAccessPolicy = await this.getAccessPolicyForUser(user.id);

    if (!apiClientUserId) {
      return { user, accessPolicy: userAccessPolicy };
    }

    const apiClientAccessPolicy = await this.getAccessPolicyForUser(apiClientUserId);
    return { user, accessPolicy: mergeAccessPolicies(userAccessPolicy, apiClientAccessPolicy) };
  }

  /**
   * Authenticate an api client user
   * @param {{ username: string, secretKey: string }} apiClientCredentials
   */
  async authenticateApiClient({ username, secretKey }) {
    const apiClient = await this.models.apiClient.findOne({ username });
    if (!apiClient) {
      throw new UnauthenticatedError(`Couldn’t find API client with username ${username}`);
    }

    const isVerified = await apiClient.verifySecretKey(secretKey);
    if (!isVerified) {
      throw new UnauthenticatedError(`Couldn’t authenticate API client ${apiClient.username}`);
    }

    const user = await apiClient.getUser();
    const accessPolicy = await this.getAccessPolicyForUser(user.id);
    return { user, accessPolicy };
  }

  /**
   * Authenticate by email/password
   * @param {{ emailAddress, password, deviceName }} authDetails
   * @param {*} [meditrakDeviceDetails]
   */
  async authenticatePassword({ emailAddress, password, deviceName }, meditrakDeviceDetails) {
    const user = await this.getAuthenticatedUser({ emailAddress, password, deviceName });
    const meditrakDevice =
      meditrakDeviceDetails && (await this.saveMeditrakDevice(user, meditrakDeviceDetails));
    const [refreshToken, accessPolicy] = await Promise.all([
      this.upsertRefreshToken(user.id, deviceName, meditrakDevice),
      this.getAccessPolicyForUser(user.id, meditrakDevice),
    ]);

    return { refreshToken: refreshToken.token, user, accessPolicy };
  }

  async authenticateRefreshToken({ refreshToken: token }) {
    if (!token) {
      throw new UnauthenticatedError('Please supply refreshToken');
    }

    // Get the refresh token from the models
    const refreshToken = await this.models.refreshToken.findOne({ token });

    // If there wasn't a refresh token, tell the user to log in again
    if (!refreshToken) {
      throw new UnauthenticatedError('Refresh token not valid, please log in again');
    }

    // If the refresh token has expired, tell the user to log in again
    if (refreshToken.expiry && refreshToken.expiry < Date.now()) {
      throw new UnauthenticatedError('Refresh token has expired, please log in again');
    }

    // There was a valid refresh token, find the user and respond
    const userId = refreshToken.user_id;
    const [user, meditrakDevice] = await Promise.all([
      this.models.user.findById(userId),
      refreshToken.meditrakDevice(),
    ]);
    const accessPolicy = await this.getAccessPolicyForUser(user.id, meditrakDevice);

    return { refreshToken: refreshToken.token, user, accessPolicy };
  }

  async authenticateOneTimeLogin({ token, deviceName }) {
    if (!token) {
      throw new UnauthenticatedError('Could not authenticate, token not provided.');
    }

    const foundToken = await this.models.oneTimeLogin.findValidOneTimeLoginOrFail(token);
    foundToken.use_date = new Date();
    foundToken.save();

    const user = await this.models.user.findById(foundToken.user_id);
    const [refreshToken, accessPolicy] = await Promise.all([
      this.upsertRefreshToken(user.id, deviceName),
      this.getAccessPolicyForUser(user.id),
    ]);

    return { refreshToken: refreshToken.token, user, accessPolicy };
  }

  async getAuthenticatedUser({ emailAddress, password, deviceName }) {
    if (!emailAddress || !password || !deviceName) {
      throw new UnauthenticatedError(
        'Please supply emailAddress, password and deviceName in the request body',
      );
    }

    // Get the user with the matching email address from the database
    const user = await this.models.user.findOne({
      email: { comparisonValue: emailAddress, comparator: 'ilike' },
    });

    // If there wasn't a user with the given email, send back a slightly obscured message
    if (!user) {
      throw new UnauthenticatedError('Email address or password not found');
    }

    // Check password hash matches that in db
    if (!(await user.checkPassword(password))) {
      throw new UnauthenticatedError('Incorrect email or password');
    }

    if (user.checkIsEmailUnverified()) {
      throw new UnverifiedError('Email address not yet verified');
    }
    return user;
  }

  /**
   * Returns a plain old javascript object representation of the user's policy. Consumers should
   * parse into an instance of AccessPolicy to use functions like `accessPolicy.allowsSome`
   * @param {string} userId
   * @param {*} [meditrakDevice]
   */
  async getAccessPolicyForUser(userId, meditrakDevice) {
    if (!meditrakDevice) return this.accessPolicyBuilder.getPolicyForUser(userId);

    // this access policy is being requested by meditrak, which means it may require the legacy
    // policy format
    const { app_version: appVersion } = meditrakDevice;
    const useLegacyFormat =
      !appVersion || compareVersions(appVersion, MAX_MEDITRAK_USING_LEGACY_POLICY) <= 0;
    return this.accessPolicyBuilder.getPolicyForUser(userId, useLegacyFormat);
  }

  async upsertRefreshToken(userId, device, meditrakDevice) {
    // Generate refresh token and save in db
    const refreshToken = randomToken.generate(REFRESH_TOKEN_LENGTH);
    try {
      return this.models.refreshToken.updateOrCreate(
        {
          user_id: userId,
          device,
        },
        { token: refreshToken, meditrak_device_id: meditrakDevice ? meditrakDevice.id : null },
      );
    } catch (error) {
      throw new DatabaseError('storing refresh token', error);
    }
  }

  async saveMeditrakDevice(user, meditrakDeviceDetails) {
    if (!meditrakDeviceDetails) return null;
    const { installId, platform, appVersion } = meditrakDeviceDetails;
    return this.models.meditrakDevice.updateOrCreate(
      { install_id: installId },
      {
        user_id: user.id,
        platform,
        app_version: appVersion,
        last_login: new Date(),
      },
    );
  }
}
