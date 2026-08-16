import moment from 'moment';
import { getTimezoneOffset } from 'date-fns-tz';

export const ISO_DATE_PATTERN = /\d{4}-\d{2}-\d{2}/;

/**
 * @returns ISO date string in the format "yyyy-mm-dd", discarding the timestamp.
 * @remarks Assumes the input date object is valid.
 */
export const getIsoDateString = (date: Date) => date.toISOString().slice(0, 10);

/**
 * @returns utcOffset in minutes
 */
const getUtcOffsetFromTimestamp = (timestamp: string) => moment.parseZone(timestamp).utcOffset();

/**
 * @returns timezone name in format: "Pacific/Fiji".
 */
export const getTimezoneNameFromTimestamp = (timestamp: string) => {
  const utcOffsetMs = getUtcOffsetFromTimestamp(timestamp) * 60 * 1000;
  const now = new Date();
  return Intl.supportedValuesOf('timeZone').find(
    name => getTimezoneOffset(name, now) === utcOffsetMs,
  );
};

export const utcMoment = (...args: Parameters<(typeof moment)['utc']>) => moment.utc(...args);
