/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

export const objectToArrayWithIds = object =>
  Object.entries(object).map(([key, value]) => ({
    id: key,
    ...value,
  }));
