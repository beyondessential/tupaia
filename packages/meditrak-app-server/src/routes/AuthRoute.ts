/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { Resolved } from '@tupaia/types';
import { yup } from '@tupaia/utils';
import { TupaiaApiClient } from '@tupaia/api-client';
import { MeditrakDeviceType } from '../models/MeditrakDevice';

export type AuthRequest = Request<
  Record<string, never>,
  | Resolved<ReturnType<TupaiaApiClient['auth']['login']>>
  | Resolved<ReturnType<TupaiaApiClient['auth']['refreshAccessToken']>>,
  Record<string, unknown>,
  {
    appVersion: string;
    grantType?: 'refresh_token';
  }
>;

const reAuthValidator = yup.object().shape({
  refreshToken: yup.string().required(),
});

const loginValidator = yup.object().shape({
  emailAddress: yup.string().required(),
  password: yup.string().required(),
  deviceName: yup.string().required(),
  devicePlatform: yup.string().required(),
  installId: yup.string().required(),
});

export class AuthRoute extends Route<AuthRequest> {
  private async updateMeditrakDevice(meditrakDevice: MeditrakDeviceType, refreshToken: string) {
    const { appVersion } = this.req.query;

    // eslint-disable-next-line no-param-reassign
    meditrakDevice.app_version = appVersion;
    // eslint-disable-next-line no-param-reassign
    meditrakDevice.refresh_token = refreshToken;
    // eslint-disable-next-line no-param-reassign
    meditrakDevice.last_login_time = new Date();

    await meditrakDevice.save();
  }

  private async refreshTokenLogin(refreshToken: string) {
    const meditrakDevice = await this.req.models.meditrakDevice.findOne({
      refresh_token: refreshToken,
    });

    if (!meditrakDevice) {
      throw new Error(`Could not find meditrak device for refresh token. Please login again.`);
    }

    const loginResponse = await this.req.ctx.services.auth.refreshAccessToken(refreshToken);
    await this.updateMeditrakDevice(meditrakDevice, loginResponse.refreshToken);
    return loginResponse;
  }

  private async userPasswordLogin(
    emailAddress: string,
    password: string,
    deviceName: string,
    installId: string,
    platform: string,
  ) {
    const loginResponse = await this.req.ctx.services.auth.login({
      emailAddress,
      password,
      deviceName,
    });

    const meditrakDevice = await this.req.models.meditrakDevice.findOrCreate(
      {
        user_id: loginResponse.user.id,
        install_id: installId,
      },
      { platform },
    );

    await this.updateMeditrakDevice(meditrakDevice, loginResponse.refreshToken);
    return loginResponse;
  }

  public async buildResponse() {
    const { query, body } = this.req;

    if (query.grantType === 'refresh_token') {
      const { refreshToken } = reAuthValidator.validateSync(body);
      return this.refreshTokenLogin(refreshToken);
    }

    const {
      emailAddress,
      password,
      deviceName,
      installId,
      devicePlatform,
    } = loginValidator.validateSync(body);

    return this.userPasswordLogin(emailAddress, password, deviceName, installId, devicePlatform);
  }
}
