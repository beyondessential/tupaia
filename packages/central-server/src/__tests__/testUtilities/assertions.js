/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const getMatch = input => (typeof input === 'string' ? new RegExp(input) : input);

export const expectError = (
  response,
  expectedError,
  expectedStatus = 500,
  regexErrorMessage = true,
) => {
  const { body, status } = response;

  expect(status).toBe(expectedStatus);
  expect(body).toHaveProperty('error');
  if (regexErrorMessage) {
    expect(body.error).toMatch(getMatch(expectedError));
  } else {
    expect(body.error).toStrictEqual(expectedError);
  }
};

export const expectErrors = (response, expectedError, expectedStatus = 500) => {
  const { body, status } = response;

  expect(status).toBe(expectedStatus);
  expect(body).toHaveProperty('errors');
  expect(body.errors).toHaveLength(1);
  expect(body.errors[0].error).toMatch(getMatch(expectedError));
};

export const expectSuccess = (response, expectedBody, expectedStatus = 200) => {
  const { body, statusCode } = response;

  expect(statusCode).toBe(expectedStatus);
  expect(body).not.toHaveProperty('error');
  expect(body).not.toHaveProperty('errors');
  if (expectedBody) {
    expect(body).toStrictEqual(expectedBody);
  }
};
