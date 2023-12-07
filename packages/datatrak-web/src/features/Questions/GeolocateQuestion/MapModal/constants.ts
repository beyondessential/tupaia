import { LatLngBoundsLiteral } from 'leaflet';

export const tileSets = {
  osm: {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    key: 'osm',
    label: 'Open Streets',
    thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/osm-tile-thumbnail.png',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  },
  satellite: {
    key: 'satellite',
    label: 'Satellite',
    thumbnail:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/satellite-tile-thumbnail.png',
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${
      import.meta.env.REACT_APP_MAPBOX_TOKEN
    }`,
  },
};

export const DEFAULT_ZOOM_LEVEL = 12;
export const UNSET_LOCATION_ZOOM_LEVEL = 3;
// These match the default bounds in `ui-map-components` but we don't import this package in this app, so we have to duplicate them here
export const DEFAULT_BOUNDS = [
  [6.5001, 110],
  [-40, 204.5],
] as LatLngBoundsLiteral;
