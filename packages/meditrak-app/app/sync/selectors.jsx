/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

export const getIsSyncing = state => state.sync.isSyncing;
export const getSyncProgress = state => state.sync.progress;
export const getSyncTotal = state => state.sync.total;
export const getLastSyncDate = state => new Date(state.sync.lastSyncTime);
export const getErrorMessage = state => state.sync.errorMessage;
export const getSyncProgressMessage = state => state.sync.progressMessage;
