import sinon from 'sinon';
import moment from 'moment-timezone';

const DEFAULT_NOW_TIMESTAMP = 1549360800000; // 2019-02-05T10:00:00.000Z

export const mockNow = (whenIsNow = DEFAULT_NOW_TIMESTAMP) => {
  sinon.useFakeTimers(whenIsNow);
  moment.tz.setDefault('Australia/Melbourne');
};

export const resetMocks = () => {
  sinon.restore();
  moment.tz.setDefault();
};
