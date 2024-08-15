/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { formatInTimeZone, getTimezoneOffset } from 'date-fns-tz';

export const formatDateInTimezone = (date, timezone, format = "yyyy-MM-dd'T'HH:mm:ssXXX") => {
  return formatInTimeZone(date, timezone, format);
};

export const getOffsetForTimezone = (timezone, date) => {
  // the offset is given in ms, so we need to convert it to hours
  const offset = getTimezoneOffset(timezone, date) / 60 / 60 / 1000;

  // round to 2 decimal places
  const offsetDec = Math.round(offset * 100) / 100;

  // split the offset into hours and minutes
  const hours = Math.abs(Math.floor(offsetDec));
  const mins = (offsetDec % 1) * 60 || '00';
  // add the correct prefix
  const prefix = offset > 0 ? '+' : '-';
  // add leading zero to hours if needed
  const leadingZero = Math.abs(hours) < 10 ? '0' : '';

  // create the offset string
  const offsetStr = `${prefix}${leadingZero}${hours}:${mins}`;

  return offsetStr;
};
