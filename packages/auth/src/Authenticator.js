/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import randomToken from 'rand-token';

import { DatabaseError, UnauthenticatedError, UnverifiedError } from '@tupaia/utils';
import { EMAIL_VERIFIED_STATUS } from './verifyEmail';

const REFRESH_TOKEN_LENGTH = 40;

export class Authenticator {
  constructor(models) {
    this.models = models;
  }

  async authenticatePassword({ emailAddress, password, deviceName }, meditrakDeviceDetails) {
    const user = await this.getAuthenticatedUser({ emailAddress, password, deviceName });
    const meditrakDeviceId = await this.saveMeditrakDevice(meditrakDeviceDetails);
    const refreshToken = await this.upsertRefreshToken({
      userId: user.id,
      deviceName,
      meditrakDeviceId,
    });

    return { refreshToken, user };
  }

  async authenticateRefreshToken({ refreshToken: token }) {
    if (!token) {
      throw new UnauthenticatedError('Please supply refreshToken');
    }

    // Get the refresh token from the models
    const refreshToken = await this.models.refreshToken.findOne({ token });

    // If there wasn't a *valid* refresh token, tell the user to log in again
    if (!refreshToken || !refreshToken.user_id || !refreshToken.token) {
      throw new UnauthenticatedError('Refresh token not valid, please log in again');
    }

    // If the refresh token has expired, tell the user to log in again
    if (refreshToken.expiry && refreshToken.expiry < Date.now()) {
      throw new UnauthenticatedError('Refresh token has expired, please log in again');
    }

    // There was a valid refresh token, find the user and respond
    const userId = refreshToken.user_id;
    const user = await this.models.user.findById(userId);

    return { refreshToken, user };
  }

  async authenticateOneTimeLogin({ token, deviceName }) {
    if (!token) {
      throw new UnauthenticatedError('Could not authenticate, token not provided.');
    }

    const foundToken = await this.models.oneTimeLogin.findValidOneTimeLoginOrFail(token);
    foundToken.use_date = new Date();
    foundToken.save();

    const user = await this.models.user.findById(foundToken.user_id);
    const refreshToken = await this.upsertRefreshToken({ userId: user.id, deviceName });

    return { refreshToken, user };
  }

  async getAuthenticatedUser({ emailAddress, password, deviceName }) {
    if (!emailAddress || !password || !deviceName) {
      throw new UnauthenticatedError(
        'Please supply emailAddress, password and deviceName in the request body',
      );
    }

    // Get the user with the matching email address from the database
    const user = await this.models.user.findOne({
      email: { comparisonValue: emailAddress, ignoreCase: true },
    });

    // If there wasn't a *valid* user with the given email, send back a slightly obscured message
    if (!user || !user.id || !user.password_hash || !user.password_salt) {
      throw new UnauthenticatedError('Email address or password not found');
    }

    // Check password hash matches that in db
    if (!user.checkPassword(password)) {
      throw new UnauthenticatedError('Incorrect email or password');
    }

    if (user.verified_email === EMAIL_VERIFIED_STATUS.NEW_USER) {
      throw new UnverifiedError('Email address not yet verified');
    }
    return user;
  }

  async saveMeditrakDevice(meditrakDeviceDetails, user) {
    if (!meditrakDeviceDetails) return null;
    const { installId, platform, appVersion } = meditrakDeviceDetails;
    const device = await this.models.meditrakDevice.updateOrCreate(
      { install_id: installId },
      {
        user_id: user.id,
        platform,
        app_version: appVersion,
      },
    );
    return device.id;
  }

  async upsertRefreshToken({ userId, deviceName, meditrakDeviceId }) {
    // Generate refresh token and save in db
    const refreshToken = randomToken.generate(REFRESH_TOKEN_LENGTH);

    try {
      return this.models.refreshToken.updateOrCreate(
        {
          user_id: userId,
          device: deviceName,
        },
        {
          token: refreshToken,
          meditrak_device_id: meditrakDeviceId,
        },
      );
    } catch (error) {
      throw new DatabaseError('storing refresh token', error);
    }
  }
}
