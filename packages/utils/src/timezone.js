/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { formatInTimeZone, getTimezoneOffset } from 'date-fns-tz';

export const formatDateInTimezone = (date, timezone, format = "yyyy-MM-dd'T'HH:mm:ssXXX") => {
  return formatInTimeZone(date, timezone, format);
};

export const getOffsetForTimezone = timezone => {
  // the offset is given in ms, so we need to convert it to hours
  const offset = getTimezoneOffset(timezone) / 60 / 60 / 1000;

  // if offset is single digit, we need to add a 0 in front of it

  if (offset > 0) {
    if (offset < 10) {
      return `+0${offset}:00`;
    }
    return `+${offset}:00`;
  }
  if (offset > -10) {
    return `-0${Math.abs(offset)}:00`;
  }
  return `${offset}:00`;
};
