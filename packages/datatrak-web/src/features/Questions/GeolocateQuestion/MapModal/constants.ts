import { LatLngBoundsLiteral } from 'leaflet';

export const DEFAULT_ZOOM_LEVEL = 12;
export const UNSET_LOCATION_ZOOM_LEVEL = 3;
// These match the default bounds in `ui-map-components` but we don't import this package in this app, so we have to duplicate them here
export const DEFAULT_BOUNDS = [
  [6.5001, 110],
  [-40, 204.5],
] as LatLngBoundsLiteral;
