/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { TileLayer, LeafletMap, ZoomControl } from '@tupaia/ui-map-components';
import { TRANSPARENT_BLACK } from '../../constants';
import { TILE_SETS } from '../../constants';

const MapContainer = styled.div`
  height: 100%;
  transition: width 0.5s ease;
  width: 100%;
`;

const StyledMap = styled(LeafletMap)`
  height: 100%;
  width: 100%;
  flex: 1;

  .leaflet-control-zoom {
    z-index: 1;
    border: none;
    top: -50px;
    right: 3px;

    a {
      background: rgba(43, 45, 56, 0.8);
      box-shadow: none;
      border: none;
      color: white;

      &:hover {
        background: ${TRANSPARENT_BLACK};
        box-shadow: none;
      }
    }
  }
`;
interface MapProps {
  activeTileSet: typeof TILE_SETS[0];
}
export const Map = ({ activeTileSet }: MapProps) => {
  return (
    <MapContainer>
      <StyledMap>
        <TileLayer tileSetUrl={activeTileSet.url} showAttribution={false} />
        <ZoomControl position="bottomright" />
      </StyledMap>
    </MapContainer>
  );
};
