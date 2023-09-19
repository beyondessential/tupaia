/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import Geolocation from '@react-native-community/geolocation';
import { GEOLOCATION_OPTIONS } from './constants';
import { requestLocationPermission, noPermissionErrorMessage } from './permission';

// This selector goes the extra mile and attempts a position get if the
// current redux state is missing the user location because a watch wasn't
// initiated.
export const getCurrentUserLocation = async (state, timeout = GEOLOCATION_OPTIONS.timeout) => {
  const { userLocation } = state;

  if (userLocation.isWatching && userLocation.latitude) {
    const { latitude, longitude, accuracy, errorMessage } = userLocation;

    return {
      latitude,
      longitude,
      accuracy,
      errorMessage,
    };
  }

  if (!(await requestLocationPermission())) {
    return {
      errorMessage: noPermissionErrorMessage,
    };
  }

  return new Promise(resolve =>
    Geolocation.getCurrentPosition(
      ({ latitude, longitude, accuracy }) => {
        resolve({
          latitude,
          longitude,
          accuracy,
        });
      },
      error => {
        resolve({
          errorMessage: error,
        });
      },
      { ...GEOLOCATION_OPTIONS, timeout },
    ),
  );
};
