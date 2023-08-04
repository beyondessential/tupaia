/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import momentTimezone from 'moment-timezone';

/**
 * @returns utcOffset in format: "+05:00"
 */
const getUtcOffsetFromTimestamp = (timestamp: string) => moment.parseZone(timestamp).format('Z');

/**
 * @returns timezone name in format: "Pacific/Fiji".
 */
export const getTimezoneNameFromTimestamp = (timestamp: string) =>
  momentTimezone.tz
    .names()
    .find(name => getUtcOffsetFromTimestamp(timestamp) === momentTimezone.tz(name).format('Z'));

export const utcMoment = (...args: Parameters<typeof moment['utc']>) => moment.utc(...args);
