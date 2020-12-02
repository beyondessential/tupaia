/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import nodeFetch from 'node-fetch';
import { CustomError } from './errors';

const DEFAULT_MAX_WAIT_TIME = 45 * 1000; // 45 seconds in milliseconds

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

  return queryParamsString
    ? `${baseUrl}/${endpoint}?${queryParamsString}`
    : `${baseUrl}/${endpoint}`;
};

// Create a promise that rejects after the request has taken too long
const createTimeoutPromise = maxWaitTime =>
  new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error('Network request timed out'));
    }, maxWaitTime);
  });

/**
 * Wrapper around node-fetch that adds timeout
 */
export const fetchWithTimeout = (url, config, maxWaitTime = DEFAULT_MAX_WAIT_TIME) =>
  Promise.race([nodeFetch(url, config), createTimeoutPromise(maxWaitTime)]);

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

const throwCustomError = (status, errorMessage) => {
  const statusCode = status || 500;
  throw new CustomError({
    responseStatus: statusCode,
    responseText: errorMessage,
  });
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
      throwCustomError(response.status, responseJson.error);
    }
  }
};
