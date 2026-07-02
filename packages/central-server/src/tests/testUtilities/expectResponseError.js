import chai from 'chai';

const { expect } = chai;

export const expectResponseError = (response, match, expectedStatusCode) => {
  const { body, statusCode } = response;
  expect(statusCode).to.equal(expectedStatusCode);
  expect(body).to.have.property('error');
  expect(body.error).to.match(match);
};

export const expectPermissionError = (response, match) => {
  expectResponseError(response, match, 403);
};
