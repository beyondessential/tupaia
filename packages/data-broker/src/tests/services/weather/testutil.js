import sinon from 'sinon';
import { expect } from 'chai';

const DEFAULT_NOW_TIMESTAMP = 1549360800000; // 2019-02-05T10:00:00.000Z

export const mockNow = (whenIsNow = DEFAULT_NOW_TIMESTAMP) => {
  sinon.useFakeTimers(whenIsNow);
};

export const resetMocks = () => {
  sinon.restore();
};

export const expectThrowsAsync = async (method, errorMessage) => {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.be.an('Error');
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
};
