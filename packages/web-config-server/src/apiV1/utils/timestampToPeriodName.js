import { PERIOD_TYPES, utcMoment } from '@tupaia/tsutils';

const PERIOD_TYPE_TO_NAME_FORMAT = {
  [PERIOD_TYPES.MONTH]: 'MMM YYYY',
  [PERIOD_TYPES.YEAR]: 'YYYY',
};

/**
 * @param {number} timestamp
 * @param {string} periodType
 */
export const timestampToPeriodName = (timestamp, periodType) =>
  utcMoment(timestamp).format(PERIOD_TYPE_TO_NAME_FORMAT[periodType]);
