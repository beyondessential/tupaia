/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

export const expectResponseError = (response, match, expectedStatusCode) => {
  const { body, statusCode } = response;
  expect(statusCode).to.equal(expectedStatusCode);
  expect(body).to.have.property('error');
  expect(body.error).to.match(match);
};

export const expectPermissionError = (response, match) => {
  expectResponseError(response, match, 403);
};
