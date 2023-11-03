/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';

import {
  SET_SYNC_ERROR,
  SET_SYNC_PROGRESS,
  SET_SYNC_TOTAL,
  SET_SYNC_MESSAGE,
  SET_SYNC_COMPLETION_TIME,
  SET_SYNC_IS_SYNCING,
} from './constants';

const defaultState = {
  progressMessage: '',
  errorMessage: '',
  total: 0,
  progress: 0,
  isSyncing: false,
  lastSyncTime: 0,
};

const stateChanges = {
  [SET_SYNC_MESSAGE]: ({ progressMessage }) => ({
    progressMessage,
    errorMessage: '',
  }),
  [SET_SYNC_PROGRESS]: ({ progress }) => ({
    progress,
    errorMessage: '',
  }),
  [SET_SYNC_ERROR]: ({ errorMessage }) => ({
    errorMessage,
    progressMessage: '',
    isSyncing: false,
  }),
  [SET_SYNC_TOTAL]: ({ total }) => ({
    total,
    errorMesssage: '',
  }),
  [SET_SYNC_IS_SYNCING]: ({ isSyncing }) => ({
    isSyncing,
  }),
  [SET_SYNC_COMPLETION_TIME]: ({ lastSyncTime }) => ({
    lastSyncTime,
  }),
};

const onRehydrate = incomingState => {
  if (!incomingState) return undefined;

  const syncState = incomingState.sync;
  if (!syncState) return undefined;

  // Ensure state never gets stuck in loading loop.
  syncState.isSyncing = defaultState.isSyncing;

  return syncState;
};

export const reducer = createReducer(defaultState, stateChanges, onRehydrate);
