import {
  SET_SYNC_PROGRESS,
  SET_SYNC_ERROR,
  SET_SYNC_TOTAL,
  SET_SYNC_MESSAGE,
  SET_SYNC_IS_SYNCING,
  SET_SYNC_COMPLETION_TIME,
  PROGRESS_LOADING,
} from './constants';
import { getLatestUserRewardCount } from '../rewards';
import { resetSocialFeed } from '../social';

export const setSyncProgress = progress => ({
  type: SET_SYNC_PROGRESS,
  progress,
});

export const setSyncError = errorMessage => ({
  type: SET_SYNC_ERROR,
  errorMessage,
});

export const setSyncTotal = total => ({
  type: SET_SYNC_TOTAL,
  total,
});

export const setSyncProgressMessage = progressMessage => ({
  type: SET_SYNC_MESSAGE,
  progressMessage,
});

export const setSyncIsSyncing = isSyncing => ({
  type: SET_SYNC_IS_SYNCING,
  isSyncing,
});

export const setSyncCompletionTime = lastSyncTime => ({
  type: SET_SYNC_COMPLETION_TIME,
  lastSyncTime,
});

export const setSyncComplete = lastSyncTime => async dispatch => {
  dispatch(setSyncCompletionTime(lastSyncTime));
  dispatch(setSyncIsSyncing(false));
  // update rewards
  dispatch(getLatestUserRewardCount());
  // reset social feed in case of permissions changes
  dispatch(resetSocialFeed());
};

export const synchroniseDatabase =
  () =>
  async (dispatch, getState, { database, analytics }) => {
    dispatch(setSyncProgress(PROGRESS_LOADING));
    return database.synchronise(dispatch);
  };
