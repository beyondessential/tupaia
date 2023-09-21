/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
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
import { ErrorBoundary } from '@tupaia/ui-components';
import { TILE_SETS, MOBILE_BREAKPOINT, openStreets, satellite } from '../../constants';
import { MapWatermark } from './MapWatermark';
import { MapLegend } from './MapLegend';
import { MapOverlaySelector } from './MapOverlaySelector';
import { useEntity } from '../../api/queries';
import { MapOverlaysLayer } from './MapOverlaysLayer';
import { useHiddenMapValues, useDefaultMapOverlay, useMapOverlayData } from './utils';
import { useGAEffect } from '../../utils';
import { DemoLand } from './DemoLand';

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
      background: ${({ theme }) => theme.navigationBtn.main};
      box-shadow: none;
      border: none;
      color: white;

      &:hover {
        background: ${({ theme }) =>
          theme.palette.type === 'light' ? 'white' : 'rgba(43, 45, 56, 0.7)'};
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
  width: 100%;
  display: flex;
  // This is to prevent the wrapper div from blocking clicks on the map overlays
  pointer-events: none;
  position: relative;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    position: absolute;
    height: 100%;
    top: 0;
    left: 0;
  }
`;

const MapControlColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    flex-direction: column-reverse;
  }
`;

/**
 * Utility function to determine whether tileSet should default to satellite
 * or to osm, based on page load time. This will only run when determining the
 * initial state of the map.
 */
const getAutoTileset = () => {
  // default to osm in dev so that we don't pay for tiles when running locally
  if (!import.meta.env.PROD) {
    return openStreets;
  } else {
    const SLOW_LOAD_TIME_THRESHOLD = 2 * 1000; // 2 seconds in milliseconds
    return ((window as unknown) as Window & {
      loadTime: number;
    })?.loadTime < SLOW_LOAD_TIME_THRESHOLD
      ? satellite
      : openStreets;
  }
};

export const Map = () => {
  const { projectCode, entityCode } = useParams();
  const { data: entity } = useEntity(projectCode, entityCode);

  useDefaultMapOverlay(projectCode, entityCode);

  // Setup legend hidden values
  const { serieses } = useMapOverlayData();
  const { hiddenValues, setValueHidden } = useHiddenMapValues(serieses);

  // Setup Tile Picker

  const initialTileSet = getAutoTileset();
  const [activeTileSet, setActiveTileSet] = useState(initialTileSet);
  useGAEffect('Map', 'Change Tile Set', activeTileSet.label);
  const onTileSetChange = (tileSetKey: string) => {
    setActiveTileSet(TILE_SETS.find(({ key }) => key === tileSetKey) as typeof TILE_SETS[0]);
  };

  const zoom = entity?.bounds ? undefined : 10;

  return (
    <ErrorBoundary>
      <MapContainer>
        <StyledMap
          center={entity?.point as LeafletMapProps['center']}
          bounds={entity?.bounds as LeafletMapProps['bounds']}
          zoom={zoom as LeafletMapProps['zoom']}
          shouldSnapToPosition
        >
          <TileLayer tileSetUrl={activeTileSet.url} showAttribution={false} />
          <MapOverlaysLayer hiddenValues={hiddenValues} />
          {/*<PolygonNavigationLayer />*/}
          {/*<DataVisualsLayer hiddenValues={hiddenValues} />*/}
          <DemoLand />
          <ZoomControl position="bottomright" />
          <MapWatermark />
        </StyledMap>
        {/* Map Controls need to be outside the map so that the mouse events on controls don't interfere with the map */}
        <MapControlWrapper>
          <MapControlColumn>
            <MapOverlaySelector />
            <MapLegend hiddenValues={hiddenValues} setValueHidden={setValueHidden} />
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
    </ErrorBoundary>
  );
};
