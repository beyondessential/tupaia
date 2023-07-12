/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import {
  TileLayer,
  LeafletMap,
  ZoomControl,
  TilePicker,
  LeafletMapProps,
} from '@tupaia/ui-map-components';
import { TRANSPARENT_BLACK, TILE_SETS, MOBILE_BREAKPOINT } from '../../constants';
import { MapWatermark } from './MapWatermark';
import { MapLegend } from './MapLegend';
import { MapOverlaySelector } from './MapOverlaySelector';
import { useEntity, useMapOverlays } from '../../api/queries';
import { PolygonLayer } from './PolygonLayer';
import { MarkerLayer } from './MarkerLayer';
import { useDefaultMapOverlay } from './useDefaultMapOverlay';

const MapContainer = styled.div`
  height: 100%;
  transition: width 0.5s ease;
  width: 100%;
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const StyledMap = styled(LeafletMap)`
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
// Position this absolutely so it can be placed over the map
const TilePickerWrapper = styled.div`
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

// This contains the map controls (legend, overlay selector, etc, so that they can fit within the map appropriately)
const MapControlWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;

  // This is to prevent the wrapper div from blocking clicks on the map overlays
  pointer-events: none;
`;

const MapControlColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const Map = () => {
  const { projectCode, entityCode } = useParams();
  const [activeTileSet, setActiveTileSet] = useState(TILE_SETS[0]);
  const { data: entity } = useEntity(entityCode);

  // set the map default overlay if there isn't one selected
  const { mapOverlaysByCode } = useMapOverlays(projectCode, entityCode);
  useDefaultMapOverlay(projectCode!, mapOverlaysByCode);

  const onTileSetChange = (tileSetKey: string) => {
    setActiveTileSet(TILE_SETS.find(({ key }) => key === tileSetKey) as typeof TILE_SETS[0]);
  };

  return (
    <MapContainer>
      <StyledMap bounds={entity?.bounds as LeafletMapProps['bounds']} shouldSnapToPosition>
        <TileLayer tileSetUrl={activeTileSet.url} showAttribution={false} />
        <PolygonLayer />
        <MarkerLayer />
        <ZoomControl position="bottomright" />
        <MapWatermark />
      </StyledMap>
      {/* Map Controls need to be outside the map so that the mouse events on controls don't inter wit the map */}
      <MapControlWrapper>
        <MapControlColumn>
          <MapOverlaySelector />
          <MapLegend />
        </MapControlColumn>
        <TilePickerWrapper>
          <TilePicker
            tileSets={TILE_SETS}
            activeTileSet={activeTileSet}
            onChange={onTileSetChange}
          />
        </TilePickerWrapper>
      </MapControlWrapper>
    </MapContainer>
  );
};
