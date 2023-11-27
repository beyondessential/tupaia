/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

export const USER_LOCATION_UPDATE = 'USER_LOCATION_UPDATE';
export const USER_LOCATION_ERROR = 'USER_LOCATION_ERROR';
export const USER_LOCATION_WATCH = 'USER_LOCATION_WATCH';
export const USER_LOCATION_STOP_WATCHING = 'USER_LOCATION_STOP_WATCHING';
export const CLEAR_LOCATION_DATA = 'CLEAR_LOCATION_DATA';

export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 0,
  distanceFilter: 1,
};
