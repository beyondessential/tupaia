/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const displayDate = (date?: Date) => {
  if (!date) {
    return '';
  }
  return new Date(date).toLocaleDateString();
};
