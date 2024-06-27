/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export const buildApiError = (message: string, statusCode: number) =>
  `API error ${statusCode}: ${message}`;

const API_ERROR_REGEX = /API error [0-9]*: /;
/**
 * `API error 401: Incorrect username or password` => `Incorrect username or password`
 */
export const formatApiErrorForFrontend = (apiError: string) => {
  if (!apiError.match(API_ERROR_REGEX)) {
    return apiError;
  }

  return apiError.split(API_ERROR_REGEX).slice(1).join('');
};
