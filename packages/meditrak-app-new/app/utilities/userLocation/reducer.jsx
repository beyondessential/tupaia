/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '..';
import {
  USER_LOCATION_UPDATE,
  USER_LOCATION_ERROR,
  USER_LOCATION_WATCH,
  USER_LOCATION_STOP_WATCHING,
  CLEAR_LOCATION_DATA,
} from './constants';

const defaultState = {
  latitude: null,
  longitude: null,
  accuracy: 'N/A',
  errorMessage: '',
  isWatching: false,
  locationWatchId: null,
};

const stateChanges = {
  [USER_LOCATION_WATCH]: ({ locationWatchId }) => ({
    isWatching: true,
    locationWatchId,
    errorMessage: defaultState.error,
  }),
  [USER_LOCATION_STOP_WATCHING]: () => ({
    isWatching: false,
    locationWatchId: null,
    // Reset to unavailable accuracy on stop in order to signal to
    // getters that the accuracy in the redux store may be stale.
    accuracy: defaultState.accuracy,
  }),
  [USER_LOCATION_UPDATE]: ({ latitude, longitude, accuracy }) => ({
    latitude,
    longitude,
    accuracy,
    errorMessage: defaultState.error,
  }),
  [USER_LOCATION_ERROR]: ({ errorMessage }) => ({
    latitude: defaultState.latitude,
    longitude: defaultState.longitude,
    accuracy: defaultState.accuracy,
    errorMessage,
  }),
  [CLEAR_LOCATION_DATA]: () => ({
    latitude: defaultState.latitude,
    longitude: defaultState.longitude,
    accuracy: defaultState.accuracy,
    errorMessage: defaultState.errorMessage,
  }),
};

const onRehydrate = incomingState => {
  if (!incomingState) return undefined;

  const userLocationState = incomingState.userLocation;
  if (!userLocationState) return undefined;

  userLocationState.isWatching = false;
  userLocationState.locationWatchId = null;
  userLocationState.accuracy = defaultState.accuracy;

  return userLocationState;
};

export const reducer = createReducer(defaultState, stateChanges, onRehydrate);
