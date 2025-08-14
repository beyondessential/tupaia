import { ApiConnection } from '@tupaia/server-boilerplate';
import {
  createBasicHeader,
  createBearerHeader,
  getEnvVarOrDefault,
  requireEnv,
} from '@tupaia/utils';
import { refreshAndSaveAccessToken } from '/appServer/requestHelpers/refreshAndSaveAccessToken';

const PUBLIC_USER_NAME = 'public';

/**
 * @deprecated use @tupaia/api-client
 */
export class ReportConnection extends ApiConnection {
  baseUrl = getEnvVarOrDefault('REPORT_API_URL', 'http://localhost:8030/v1');

  constructor(req) {
    const userName = req?.userJson?.userName;

    const getAuthHeader = async () => {
      // If we're authorized using a header already, forward that header
      const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
      if (authHeader) {
        return authHeader;
      }

      if (userName === PUBLIC_USER_NAME) {
        const API_CLIENT_NAME = requireEnv('API_CLIENT_NAME');
        const API_CLIENT_PASSWORD = requireEnv('API_CLIENT_PASSWORD');

        const PUBLIC_USER_AUTH_HEADER = createBasicHeader(API_CLIENT_NAME, API_CLIENT_PASSWORD);
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
