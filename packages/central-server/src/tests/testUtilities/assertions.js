import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;

const getMatch = input => (typeof input === 'string' ? new RegExp(input) : input);

export const expectError = (
  response,
  expectedError,
  expectedStatus = 500,
  regexErrorMessage = true,
) => {
  const { body, status } = response;

  expect(status).to.equal(expectedStatus);
  expect(body).to.have.property('error');
  if (regexErrorMessage) {
    expect(body.error).to.match(getMatch(expectedError));
  } else {
    expect(body.error).to.equal(expectedError);
  }
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
