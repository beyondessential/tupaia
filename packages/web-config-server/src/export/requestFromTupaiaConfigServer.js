import { fetchWithTimeout } from '@tupaia/utils';

const BASE_URL = process.env.CONFIG_SERVER_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * Requests a URL, returning a promise
 *
 * @param {string}  endpoint             The specific URL endpoint we want to request
 * @param {array}   [queryParameters]    Any query parameters to include in the request
 * @param {object}  [options]            The options we want to pass to "fetch"
 * @param {boolean} [shouldRetryOnFail]  Whether it should make a second attempt if the first request fails
 *
 * @return {object}           The response data
 */
export const requestFromTupaiaConfigServer = async (
  endpoint,
  queryParameters = {},
  sessionCookieName,
  sessionCookie,
  shouldRetryOnFail = true,
  additionalHeaders = {},
) => {
  try {
    const headers = {
      cookie: `${sessionCookieName}=${sessionCookie}`,
      ...additionalHeaders
    };

    const response = await fetchWithTimeout(
      `${BASE_URL}/${endpoint}${queryParametersToString(queryParameters)}`,
      { headers },
    );

    if (response.status < 200 || response.status >= 300) {
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (shouldRetryOnFail) {
      return requestFromTupaiaConfigServer(
        endpoint,
        queryParameters,
        sessionCookieName,
        sessionCookie,
        false,
      );
    }
    throw error;
  }
};

const queryParametersToString = queryParameters =>
  Object.entries(queryParameters).reduce(
    (stringSoFar, [key, value]) =>
      value === undefined
        ? stringSoFar
        : `${stringSoFar ? `${stringSoFar}&` : '?'}${encodeURIComponent(key)}=${encodeURIComponent(
            value,
          )}`,
    null,
  );
