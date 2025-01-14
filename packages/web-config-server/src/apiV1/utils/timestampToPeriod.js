import winston from 'winston';

import { utcMoment } from '@tupaia/tsutils';

/**
 * transform timestamp to period format
 * @param {string} timestamp
 * timestamp can be moment-parsable string, but must include Day, Month & Year information.
 * e.g.: 2017-06-22 13:45:28.836+10
 *       27-02-2018
 *       Mon, 06 Mar 2017 21:22:23 +0000
 *
 * @return {string} timestamp formatted to match DHIS2 period
 * i.e.: 20170622
 */
export const timestampToPeriod = timestamp => {
  const date = utcMoment(timestamp);
  const errors = [];
  if (!date.isValid()) errors.push(`\tMoment could not parse: "${timestamp}"`);
  if (!date.year() || !date.month() || !date.day()) {
    errors.push('\tMissing Day, Month or Year values');
  }

  if (errors.length > 0) {
    const errorMessage = errors.join('\n');
    winston.error(`timestampToPeriod returned with errors: \n${errorMessage}`);
    return null;
  }
  return utcMoment(timestamp).format('YYYYMMDD');
};
