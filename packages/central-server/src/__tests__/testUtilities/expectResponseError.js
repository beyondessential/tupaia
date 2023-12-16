/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const expectResponseError = (response, match, expectedStatusCode) => {
  const { body, statusCode } = response;
  expect(statusCode).toBe(expectedStatusCode);
  expect(body).toHaveProperty('error');
  expect(body.error).toMatch(match);
};

export const expectPermissionError = (response, match) => {
  expectResponseError(response, match, 403);
};
