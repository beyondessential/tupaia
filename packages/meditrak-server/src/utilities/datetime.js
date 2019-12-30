import moment from 'moment';
import momentTimezone from 'moment-timezone';

/**
 * @param {string} timestamp timestamp to get utcOffset from
 *
 * @returns {string} utcOffset in format: "+05:00"
 */
const getUtcOffsetFromTimestamp = timestamp => moment.parseZone(timestamp).format('Z');

/**
 * @param {string} utcOffset utcOffset to match to timezone name
 *
 * @returns {string} timezone name in format: "Pacific/Fiji".
 */
export const getTimezoneNameFromTimestamp = timestamp =>
  momentTimezone.tz
    .names()
    .find(name => getUtcOffsetFromTimestamp(timestamp) === momentTimezone.tz(name).format('Z'));
