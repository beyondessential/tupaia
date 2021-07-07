/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const isMarkedChange = changeDetails => {
  const { type, oldRecord, newRecord } = changeDetails;
  // If there are no different fields for an `update` change, it means that
  // the change was triggered manually rather than a result of an actual DB update
  return type === 'update' && JSON.stringify(oldRecord) === JSON.stringify(newRecord);
};
