/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { REHYDRATE } from 'redux-persist';

import { getDeviceAppVersion } from './getAppVersions';

const updatedVersionState = {
  currentVersion: getDeviceAppVersion() || '0.0.0',
};

export const reducer = (state = updatedVersionState, action) => {
  if (action.type === REHYDRATE) return { ...updatedVersionState };
  return state;
};
