/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { requireEnv } from './requireEnv';

/**
 * Simple feature flag functionality implemented via env vars
 *
 * @param {string} featureName
 * @returns {boolean}
 */
export const isFeatureEnabled = featureName => {
  return requireEnv(`FEATURE_FLAG_${featureName}`).toLowerCase() === 'on';
};
