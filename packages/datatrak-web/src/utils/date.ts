/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { format } from 'date-fns';

export const displayDate = (date?: Date | null) => {
  if (!date) {
    return '';
  }
  return new Date(date).toLocaleDateString();
};

export const displayDateTime = (date?: Date | null) => {
  if (!date) {
    return '';
  }

  const dateDisplay = displayDate(date);
  const timeDisplay = format(new Date(date), 'p');
  return `${dateDisplay} ${timeDisplay}`;
};
