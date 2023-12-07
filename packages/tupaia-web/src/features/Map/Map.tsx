/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import {
  TileLayer,
  LeafletMap,
  ZoomControl,
  TilePicker,
  getAutoTileSet,
  DEFAULT_TILESETS,
} from '@tupaia/ui-map-components';
import { ErrorBoundary } from '@tupaia/ui-components';
import { useProject } from '../../api/queries';
import { useGAEffect } from '../../utils';
import { CUSTOM_TILE_SETS, MOBILE_BREAKPOINT } from '../../constants';
import { MapWatermark } from './MapWatermark';
import { MapLegend } from './MapLegend';
import { MapOverlaySelector } from './MapOverlaySelector';
import { MapOverlaysLayer } from './MapOverlaysLayer';
import { useHiddenMapValues, useDefaultMapOverlay, useMapOverlayMapData } from './utils';
import { DemoLand } from './DemoLand';

const MapContainer = styled.div`
  height: 100%;
  transition: width 0.5s ease;
  width: 100%;
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;

  .leaflet-container {
    min-height: 15rem;
  }
`;

const StyledMap = styled(LeafletMap)`
  height: 100%;
  width: 100%;
  flex: 1;

  .leaflet-pane {
    // Set z-index of map pane to 0 so that it doesn't overlap with the sidebar and the map controls
    z-index: 0;
  }

  .leaflet-bottom {
    // Set the z-index to 1 so it doesn't overlap dashboard controls on mobile
    z-index: 1;
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

const useTileSets = () => {
  const { projectCode } = useParams();
  const { data: project } = useProject(projectCode);
  const initialTileSet = getAutoTileSet();
  const [activeTileSet, setActiveTileSet] = useState(initialTileSet);
  const { tileSets = '' } = project?.config || {};
  const customTilesetNames = tileSets?.split(',') || [];
  const customTileSets = customTilesetNames
    .map(
      tileset =>
        CUSTOM_TILE_SETS.find(({ key }) => key === tileset) as (typeof CUSTOM_TILE_SETS)[0],
    )
    .filter(item => item);
  const defaultTileSets = [DEFAULT_TILESETS.osm, DEFAULT_TILESETS.satellite];
  const availableTileSets = [...defaultTileSets, ...customTileSets];

  useGAEffect('Map', 'Change Tile Set', activeTileSet?.label);

  const onTileSetChange = (tileSetKey: string) => {
    const newActiveTileSet = availableTileSets.find(
      ({ key }) => key === tileSetKey,
    ) as (typeof CUSTOM_TILE_SETS)[0];
    setActiveTileSet(newActiveTileSet);
  };

  useEffect(() => {
    if (
      activeTileSet &&
      availableTileSets.length &&
      !availableTileSets.some(({ key }) => key === activeTileSet.key)
    ) {
      setActiveTileSet(initialTileSet);
    }
  }, [JSON.stringify(availableTileSets)]);

  return {
    availableTileSets,
    activeTileSet,
    onTileSetChange,
  };
};

export const Map = () => {
  const { projectCode, entityCode } = useParams();

  useDefaultMapOverlay(projectCode, entityCode);

  // Setup legend hidden values
  const { serieses } = useMapOverlayMapData();
  const { hiddenValues, setValueHidden } = useHiddenMapValues(serieses);

  const { availableTileSets, activeTileSet, onTileSetChange } = useTileSets();

  return (
    <MapContainer>
      <ErrorBoundary>
        <StyledMap shouldSnapToPosition>
          <TileLayer tileSetUrl={activeTileSet.url} showAttribution={false} />
          <MapOverlaysLayer hiddenValues={hiddenValues} />
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
              tileSets={availableTileSets}
              activeTileSet={activeTileSet}
              onChange={onTileSetChange}
            />
          </TilePickerWrapper>
        </MapControlWrapper>
      </ErrorBoundary>
    </MapContainer>
  );
};
