/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import momentTimezone from 'moment-timezone';

export const ISO_DATE_PATTERN = /\d{4}-\d{2}-\d{2}/;

/**
 * @returns ISO date string in the format "yyyy-mm-dd", or `null` if the input date object is
 * invalid.
 */
export const getIsoDateString = (date: Date) =>
  isNaN(date.getTime()) ? null : date.toISOString().slice(1, 10);

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
