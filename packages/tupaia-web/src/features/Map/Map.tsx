/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { TileLayer, LeafletMap, ZoomControl, TilePicker } from '@tupaia/ui-map-components';
import { TRANSPARENT_BLACK, TILE_SETS, MOBILE_BREAKPOINT } from '../../constants';
import { MapWatermark } from './MapWatermark';
import { MapLegend } from './MapLegend';
import { MapOverlays } from '../MapOverlays';
import { MapOverlaySelector } from './MapOverlaySelector';
import { useEntitiesWithLocation } from '../../api/queries';

const StyledMap = styled(LeafletMap)`
  position: relative;
  height: 100%;
  width: 100%;
  flex: 1;

  .leaflet-pane {
    // Set z-index of map pane to 0 so that it doesn't overlap with the sidebar and the map controls
    z-index: 0;
  }

  // Overwrite default zoom control styles
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
    @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
      display: none;
    }
  }
`;

const StyledTilePicker = styled(TilePicker)`
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;
export const Map = () => {
  const { projectCode, entityCode } = useParams();
  const [activeTileSet, setActiveTileSet] = useState(TILE_SETS[0]);

  const { data: entityData } = useEntitiesWithLocation(projectCode, entityCode);

  const onTileSetChange = (tileSetKey: string) => {
    setActiveTileSet(TILE_SETS.find(({ key }) => key === tileSetKey) as typeof TILE_SETS[0]);
  };

  return (
    // <MapContainer>
    <StyledMap bounds={entityData?.bounds} shouldSnapToPosition>
      <TileLayer tileSetUrl={activeTileSet.url} showAttribution={false} />
      <MapOverlays />
      <ZoomControl position="bottomright" />
      <MapOverlaySelector />
      <MapLegend />
      <StyledTilePicker
        tileSets={TILE_SETS}
        activeTileSet={activeTileSet}
        onChange={onTileSetChange}
      />
      <MapWatermark />
    </StyledMap>
    // </MapContainer>
  );
};
