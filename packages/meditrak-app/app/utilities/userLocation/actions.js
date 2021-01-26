/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import Geolocation from '@react-native-community/geolocation';

import {
  USER_LOCATION_UPDATE,
  USER_LOCATION_ERROR,
  USER_LOCATION_WATCH,
  USER_LOCATION_STOP_WATCHING,
  GEOLOCATION_OPTIONS,
  CLEAR_LOCATION_DATA,
} from './constants';

import { requestLocationPermission, noPermissionErrorMessage } from './permission';

export const watchUserLocation = () => async (dispatch, getState) => {
  const { locationWatchId } = getState();
  if (locationWatchId) {
    return;
  }

  if (!(await requestLocationPermission())) {
    dispatch(onGeolocationError(noPermissionErrorMessage));
    return;
  }

  const newLocationWatchId = Geolocation.watchPosition(
    position => dispatch(onGeolocationPosition(position.coords)),
    error => dispatch(onGeolocationError(error.message)),
    GEOLOCATION_OPTIONS,
  );

  // Perform an initial get as watchPosition's don't return locations
  // until the device has changed location.
  Geolocation.getCurrentPosition(
    position => dispatch(onGeolocationPosition(position.coords)),
    error => dispatch(onGeolocationError(error.message)),
    GEOLOCATION_OPTIONS,
  );

  dispatch({
    type: USER_LOCATION_WATCH,
    locationWatchId: newLocationWatchId,
  });
};

export const refreshWatchingUserLocation = () => dispatch => {
  dispatch({ type: CLEAR_LOCATION_DATA });

  Geolocation.getCurrentPosition(
    position => dispatch(onGeolocationPosition(position.coords)),
    error => dispatch(onGeolocationError(error.message)),
    GEOLOCATION_OPTIONS,
  );
};

export const stopWatchingUserLocation = () => (dispatch, getState) => {
  const { locationWatchId } = getState();

  if (locationWatchId) {
    Geolocation.clearWatch(locationWatchId);
  }

  dispatch({
    type: USER_LOCATION_STOP_WATCHING,
  });
};

const onGeolocationPosition = ({ latitude, longitude, accuracy }) => ({
  type: USER_LOCATION_UPDATE,
  latitude,
  longitude,
  accuracy,
});

const onGeolocationError = errorMessage => ({
  type: USER_LOCATION_ERROR,
  errorMessage,
});
