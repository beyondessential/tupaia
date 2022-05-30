/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection } from '@tupaia/server-boilerplate';
import { createBasicHeader, createBearerHeader } from '@tupaia/utils';
import { refreshAndSaveAccessToken } from '/appServer/requestHelpers/refreshAndSaveAccessToken';

const { MICROSERVICE_CLIENT_USERNAME, MICROSERVICE_CLIENT_SECRET } = process.env;

const PUBLIC_USER_NAME = 'public';
const PUBLIC_USER_AUTH_HEADER = createBasicHeader(
  MICROSERVICE_CLIENT_USERNAME,
  MICROSERVICE_CLIENT_SECRET,
);

const { REPORT_API_URL = 'http://localhost:8030/v1' } = process.env;

/**
 * @deprecated use @tupaia/api-client
 */
export class ReportConnection extends ApiConnection {
  baseUrl = REPORT_API_URL;

  constructor(req) {
    const userName = req?.userJson?.userName;

    const getAuthHeader = async () => {
      if (userName === PUBLIC_USER_NAME) {
        return PUBLIC_USER_AUTH_HEADER;
      }

      const {
        accessToken,
        access_token_expiry: accessTokenExpiry,
        refreshToken,
      } = await req.models.userSession.findOne({
        userName,
      });

      const validAccessToken =
        accessTokenExpiry > Date.now() // Is accessToken still valid?
          ? accessToken
          : await refreshAndSaveAccessToken(req.models, refreshToken, userName);

      return createBearerHeader(validAccessToken);
    };

    super({ getAuthHeader });
  }

  async fetchReport(reportCode, query) {
    return this.get(`fetchReport/${reportCode}`, query);
  }
}
