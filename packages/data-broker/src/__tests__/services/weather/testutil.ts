import MockDate from 'mockdate';

const DEFAULT_NOW_TIMESTAMP = 1549360800000; // 2019-02-05T10:00:00.000Z

export const mockNow = (whenIsNow = DEFAULT_NOW_TIMESTAMP) => {
  MockDate.set(whenIsNow);
};
