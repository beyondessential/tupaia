import {
  CustomError,
  fetchWithTimeout,
  stringifyQuery,
  createBasicHeader,
  createBearerHeader,
  requireEnv,
} from '@tupaia/utils';
import { refreshAndSaveAccessToken } from './refreshAndSaveAccessToken';

/**
 * Send request to Central server and handle responses.
 *
 * @param {string} endpoint
 *   The api endpoint path eg 'auth' or 'user'.
 * @param {object} payload
 *   The JSON object to send in the body of the POST (will be GET if null)
 * @param {object} queryParameters
 *   Any parameters to append after the ? in the url query
 * @param {object} authHeader
 *   To overwrite the default Authorization header, e.g. if using an access token
 */
export const fetchFromCentralServer = async (endpoint, payload, queryParameters, authHeader) => {
  const API_CLIENT_NAME = requireEnv('API_CLIENT_NAME');
  const API_CLIENT_PASSWORD = requireEnv('API_CLIENT_PASSWORD');
  const DEFAULT_AUTH_HEADER = createBasicHeader(API_CLIENT_NAME, API_CLIENT_PASSWORD);
  const url = stringifyQuery(
    process.env.TUPAIA_APP_SERVER_URL || 'http://localhost:8090/v2',
    endpoint,
    queryParameters,
  );
  const config = {
    method: payload ? 'POST' : 'GET',
    headers: {
      Authorization: authHeader || DEFAULT_AUTH_HEADER,
      'Content-Type': 'application/json',
    },
  };

  if (payload) {
    config.body = JSON.stringify(payload);
  }

  const response = await fetchWithTimeout(url, config);
  if (response.ok) {
    if (response.headers.get('Content-Type').includes('application/json')) {
      return response.json();
    }
    return response;
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (error) {
    throw error;
  }

  const errorMessage = responseJson.error ? responseJson.error : 'Could not complete your request';
  const statusCode = response ? response.status : 500;
  throw new CustomError({
    responseStatus: statusCode,
    responseText: {
      status: 'appServerError',
      details: errorMessage,
    },
  });
};

// Send request to the Tupaia App server using access/refresh tokens
export const fetchFromCentralServerUsingTokens = async (
  models,
  endpoint,
  payload,
  queryParameters,
  userName,
) => {
  const UNAUTHORIZED_STATUS_CODE = 401;
  const fetchWithAccessToken = async token =>
    fetchFromCentralServer(endpoint, payload, queryParameters, createBearerHeader(token));

  const refreshAccessAndFetch = async refreshToken => {
    const newAccessToken = await refreshAndSaveAccessToken(models, refreshToken, userName);
    return fetchWithAccessToken(newAccessToken);
  };

  const { accessToken, refreshToken } = await models.userSession.findOne({ userName });
  if (!accessToken) {
    return refreshAccessAndFetch(refreshToken);
  }

  try {
    return await fetchWithAccessToken(accessToken);
  } catch (error) {
    // if the error is unauthorized, could be an expired access token
    if (error.statusCode === UNAUTHORIZED_STATUS_CODE) {
      return refreshAccessAndFetch(refreshToken);
    }
    throw error;
  }
};
