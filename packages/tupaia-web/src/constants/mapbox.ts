/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const MAPBOX_TOKEN =
  'pk.eyJ1Ijoic3Vzc29sIiwiYSI6ImNqNHMwOW02MzFhaGIycXRjMnZ1dXFlN2gifQ.1sAg5w7hYU7e3LtJM0-hSg';

const URLS = {
  osm: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  satellite: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
};

type Key = keyof typeof URLS;
const openStreets = (key: Key) => ({
  key,
  label: 'Open Streets',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/osm-tile-thumbnail.png',
  url: URLS[key],
});
const satellite = (key: Key) => ({
  key,
  label: 'Satellite',
  thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/satellite-tile-thumbnail.png',
  url: URLS[key],
});

export const TILE_SETS = [openStreets('osm'), satellite('satellite')];
