/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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

/**
 * @param  {...any} args
 * @returns {Moment}
 */
export const utcMoment = (...args) => moment.utc(...args);

/**
 *  @param {string} date 'YYYY-MM-DD'
 *  @param  {number} amount eg. 4
 *  @param {string} unit 'years' see momentjs
 *  @returns {string} 'YYYY-MM-DD'
 */
export const dateShift = (date, amount, unit) => {
  if (date) {
    return moment(date).add(amount, unit).format('YYYY-MM-DD');
  }
  return date;
};
