/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { requireEnv, getEnvVarOrDefault } from './requireEnv';

export const FEATURE_FLAG_ON = 'on';
export const FEATURE_FLAG_OFF = 'off';

/**
 * Simple feature flag functionality implemented via env vars
 *
 * @param {string} featureName
 * @param {string} [defaultState] default setting for the flag, either 'on' or 'off'
 * @returns {boolean}
 */
export const isFeatureEnabled = (featureName, defaultState) => {
  const flagName = `FEATURE_FLAG_${featureName}`;

  const flagState = defaultState
    ? getEnvVarOrDefault(flagName, defaultState)
    : requireEnv(flagName);

  return flagState.toLowerCase() === FEATURE_FLAG_ON;
};
