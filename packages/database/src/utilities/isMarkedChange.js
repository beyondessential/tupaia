/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const isMarkedChange = changeDetails => {
  const { type, oldRecord, newRecord } = changeDetails;
  // If all fields are the same in an `update` change, it means that it is
  // a manually triggered (marked) change rather than an actual DB update
  return type === 'update' && JSON.stringify(oldRecord) === JSON.stringify(newRecord);
};
