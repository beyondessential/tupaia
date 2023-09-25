/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const validateAccessPolicy = accessPolicy => {
  if (accessPolicy === null || typeof accessPolicy !== 'object') {
    throw new Error(`Invalid AccessPolicyObject type! Expected object, got: ${accessPolicy}`);
  }
};
