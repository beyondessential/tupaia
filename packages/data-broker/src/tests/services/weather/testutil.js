import sinon from 'sinon';

const DEFAULT_NOW_TIMESTAMP = 1549360800000; // 2019-02-05T10:00:00.000Z

export const mockNow = (whenIsNow = DEFAULT_NOW_TIMESTAMP) => {
  sinon.useFakeTimers(whenIsNow);
};

export const resetMocks = () => {
  sinon.restore();
};
