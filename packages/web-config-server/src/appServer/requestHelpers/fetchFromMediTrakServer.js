import { fetchWithTimeout, stringifyQuery } from '@tupaia/utils';
import { UserSession } from '/models';
import { refreshAccessToken } from './refreshAccessToken';
import { CustomError } from '/errors';

const TUPAIA_CONFIG_SERVER_DEVICE_NAME = 'Tupaia Config Server';

/**
 * Send request to Meditrak server and handle responses.
 *
 * @param {string} endpoint
 *   The api endpoint path eg 'auth' or 'user'.
 * @param {object} payload
 *   The JSON object to send in the body of the POST (will be GET if null)
 * @param {object} queryParameters
 *   Any parameters to append after the ? in the url query
 * @param {object} headers
 *   Any additional headers to send with the http request, e.g. can overwrite default Authorization
 */
export const fetchFromMediTrakServer = async (endpoint, payload, queryParameters, headers = {}) => {
  const url = stringifyQuery(process.env.TUPAIA_APP_SERVER_URL, endpoint, queryParameters);
  const config = {
    method: payload ? 'POST' : 'GET',
    headers: {
      Authorization: `Basic ${process.env.TUPAIA_APP_SERVER_AUTH}`,
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (payload) {
    config.body = JSON.stringify({ deviceName: TUPAIA_CONFIG_SERVER_DEVICE_NAME, ...payload });
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
export const fetchFromMeditrakServerUsingTokens = async (
  endpoint,
  payload,
  queryParameters,
  headers = {},
  userName,
) => {
  const UNAUTHORIZED_STATUS_CODE = 401;
  const { accessToken, refreshToken } = await UserSession.findOne({ userName });
  const newHeaders = headers;
  newHeaders.Authorization = `Bearer ${accessToken}`;

  try {
    return await fetchFromMediTrakServer(endpoint, payload, queryParameters, newHeaders);
  } catch (error) {
    // If the error is not related to authorization, throw it
    if (error.statusCode !== UNAUTHORIZED_STATUS_CODE) {
      throw error;
    }
  }

  // If request was not authorized, refresh access token and try once more
  try {
    const newAccessToken = await refreshAccessToken(refreshToken, userName);
    newHeaders.Authorization = `Bearer ${newAccessToken}`;
    return await fetchFromMediTrakServer(endpoint, payload, queryParameters, newHeaders);
  } catch (error) {
    throw error;
  }
};
