/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

// used to strip the tz suffix so that a date can be added to the database without converting to utc
// we don't want any timezone conversions when working with data_time
const ISO_DATE_FORMAT_WITHOUT_TZ = 'YYYY-MM-DDTHH:mm:ss.SSS';
export function stripTimezoneFromDate(date) {
  return moment.parseZone(date).format(ISO_DATE_FORMAT_WITHOUT_TZ);
}
