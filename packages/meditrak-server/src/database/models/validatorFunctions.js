/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

export const hasContent = value => {
  if (value === undefined || value === null || value.length === 0) {
    return 'Should not be empty';
  }
  return null;
};
