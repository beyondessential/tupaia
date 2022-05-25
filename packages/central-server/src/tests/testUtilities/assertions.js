/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

const getMatch = input => (typeof input === 'string' ? new RegExp(input) : input);

export const expectError = (response, expectedError, expectedStatus = 500) => {
  const { body, status } = response;

  expect(status).to.equal(expectedStatus);
  expect(body).to.have.property('error');
  expect(body.error).to.match(getMatch(expectedError));
};

export const expectErrors = (response, expectedError, expectedStatus = 500) => {
  const { body, status } = response;

  expect(status).to.equal(expectedStatus);
  expect(body).to.have.property('errors');
  expect(body.errors).to.have.length(1);
  expect(body.errors[0].error).to.match(getMatch(expectedError));
};

export const expectSuccess = (response, expectedBody, expectedStatus = 200) => {
  const { body, statusCode } = response;

  expect(statusCode).to.equal(expectedStatus, body.error);
  expect(body.error).to.be.undefined;
  expect(body.errors).to.be.undefined;
  if (expectedBody) {
    expect(body).to.deep.equal(expectedBody);
  }
};
