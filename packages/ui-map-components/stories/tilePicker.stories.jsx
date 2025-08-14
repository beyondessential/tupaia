import React, { useState } from 'react';
import styled from 'styled-components';
import { MapContainer } from 'react-leaflet';
import { TileLayer, TilePicker as TilePickerComponent } from '../src/components';

const Container = styled.div`
  position: relative;
  height: 500px;
`;

export default {
  title: 'Map/TilePicker',
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const MAPBOX_TOKEN =
  'pk.eyJ1Ijoic3Vzc29sIiwiYSI6ImNqNHMwOW02MzFhaGIycXRjMnZ1dXFlN2gifQ.1sAg5w7hYU7e3LtJM0-hSg';

const TILE_SETS = [
  {
    key: 'osm',
    label: 'Open Streets',
    thumbnail: 'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/osm-tile-thumbnail.png',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  },
  {
    key: 'satellite',
    label: 'Satellite',
    thumbnail:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/satellite-tile-thumbnail.png',
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
  },
];

const TilePicker = styled(TilePickerComponent)`
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 999;
  pointer-events: none;
`;

export const SimpleTilePicker = () => {
  const [activeTileSetKey, setActiveTileSetKey] = useState(TILE_SETS[0].key);
  const activeTileSet = TILE_SETS.find(tileSet => tileSet.key === activeTileSetKey);
  return (
    <>
      <MapContainer>
        <TileLayer tileSetUrl={activeTileSet.url} />
      </MapContainer>
      <TilePicker
        tileSets={TILE_SETS}
        activeTileSet={activeTileSet}
        onChange={setActiveTileSetKey}
      />
    </>
  );
};
