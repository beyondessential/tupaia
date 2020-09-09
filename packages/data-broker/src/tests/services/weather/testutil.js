import sinon from 'sinon';

export const mockNow = whenIsNow => {
  if (!whenIsNow) {
    whenIsNow = 1549360800000; // 2019-02-05T10:00:00.000Z
  }

  sinon.useFakeTimers(whenIsNow);
};

export const resetMocks = () => {
  sinon.restore();
};
