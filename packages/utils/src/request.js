import { CustomError } from './errors';

const DEFAULT_MAX_WAIT_TIME = 120 * 1000; // 120 seconds in milliseconds

const buildParameterString = (key, value) => {
  return Array.isArray(value)
    ? value.map(v => buildParameterString(key, v)).join('&')
    : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
};

export const stringifyQuery = (baseUrl, endpoint, queryParams) => {
  const queryParamsString = Object.entries(queryParams || {})
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => buildParameterString(key, value))
    .join('&');

  const urlAndEndpoint = baseUrl ? `${baseUrl}/${endpoint}` : endpoint;

  return queryParamsString ? `${urlAndEndpoint}?${queryParamsString}` : `${urlAndEndpoint}`;
};

/**
 * @param {string} url
 * @param {RequestInit} [requestInit]
 * @param {number} [timeout]
 * @return {Promise<Response>}
 */
export const fetchWithTimeout = async (url, requestInit, timeout = DEFAULT_MAX_WAIT_TIME) => {
  // Not simply using `AbortSignal.timeout(maxWaitTime)`, which would also abort the response body
  // mid-read. Only time out waiting for response headers; once they arrive, let the body take as
  // long as it needs (e.g. streamed exports, large DHIS2 responses).
  const timeoutController = new AbortController();
  const timer = setTimeout(
    () => timeoutController.abort(new DOMException('Network request timed out', 'TimeoutError')),
    timeout,
  );
  const signal =
    requestInit?.signal != null
      ? AbortSignal.any([requestInit.signal, timeoutController.signal])
      : timeoutController.signal;
  try {
    return await fetch(url, { ...requestInit, signal });
  } catch (error) {
    if (error.name === 'TimeoutError') throw new Error('Network request timed out');
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Takes in an object specification in the form
 * {
 *    key1: asynchronousValueFetchingFunction1,
 *    key2: asynchronousValueFetchingFunction2,
 * }
 * and runs the asynchronous value fetching functions in parallel, returning the object with the
 * values filled in the keys matching the structure passed in.
 * E.g.
 * const temparatures = await asynchronouslyFetchValuesForObject({
 *    currentTemperature: asyncFetchTempFromApi,
 *    yesterdaysTemperature: () => database.findOne('temparature', { date: new Date().getDate() - 1 }),
 * });
 * console.log(temperatures);
 * Might print
 * {
 *    currentTemperature: 24,
 *    yesterdaysTemperature: 22,
 * }
 * @param {object} objectSpecification An object specifying the keys to be filled in the return
 * object, along with asynchronous functions to fill each
 */
export const asynchronouslyFetchValuesForObject = async objectSpecification => {
  const returnObject = {};
  await Promise.all(
    Object.entries(objectSpecification).map(async ([key, asynchronouslyFetchValue]) => {
      returnObject[key] = await asynchronouslyFetchValue();
    }),
  );
  return returnObject;
};

const throwCustomError = (status, errorMessage, errorDetails) => {
  const statusCode = status || 500;
  throw new CustomError(
    {
      responseStatus: statusCode,
      responseText: errorMessage,
    },
    { errorDetails },
  );
};

export const verifyResponseStatus = async response => {
  if (!response.ok) {
    let responseJson;
    try {
      responseJson = await response.json();
    } catch (error) {
      throw new Error(`Network error ${response.status}`);
    }
    if (
      response.status &&
      (response.status < 200 || response.status >= 300) &&
      !responseJson.error
    ) {
      throwCustomError(response.status, responseJson.message);
    }
    if (responseJson.error) {
      const { error: errorMessage, ...restOfError } = responseJson;
      throwCustomError(response.status, errorMessage, restOfError);
    }
  }
};
