import { requireEnv, getEnvVarOrDefault } from './requireEnv';

export const FEATURE_FLAG_ON = 'on';
export const FEATURE_FLAG_OFF = 'off';

const FLAGS = {
  MEDITRAK_SYNC_QUEUE: {
    default: FEATURE_FLAG_ON,
  },
  SERVER_CHANGE_ENQUEUER: {
    default: FEATURE_FLAG_OFF,
  },
};

/**
 * Simple feature flag functionality implemented via env vars
 *
 * @param {string} featureName
 * @returns {boolean}
 */
export const isFeatureEnabled = featureName => {
  if (!(featureName in FLAGS)) {
    throw new Error(`Unknown feature flag: ${featureName}`);
  }

  let flagState;
  const envVar = `FEATURE_FLAG_${featureName}`;
  if (FLAGS[featureName].default) {
    flagState = getEnvVarOrDefault(envVar, FLAGS[featureName].default);
  } else {
    flagState = requireEnv(envVar);
  }

  return flagState.toLowerCase() === FEATURE_FLAG_ON;
};
