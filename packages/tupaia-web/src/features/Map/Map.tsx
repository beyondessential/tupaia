/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { TileLayer, LeafletMap, ZoomControl, TilePicker } from '@tupaia/ui-map-components';
import { TRANSPARENT_BLACK, TILE_SETS, MOBILE_BREAKPOINT } from '../../constants';
import { MapWatermark } from './MapWatermark';
import { MapLegend } from './MapLegend';
import { PolygonLayer } from './PolygonLayer';
import { MapOverlaySelector } from './MapOverlaySelector';
import { useEntities } from '../../api/queries';
import { useParams } from 'react-router-dom';

const MapContainer = styled.div`
  height: 100%;
  transition: width 0.5s ease;
  width: 100%;
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
  position: absolute;
  right: 0;
  bottom: 0;
  height: 100%;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const ENTITY_FIELDS = ['parent_code', 'code', 'name', 'type', 'bounds', 'region'];

export const Map = () => {
  const { projectCode, entityCode } = useParams();
  const [activeTileSet, setActiveTileSet] = useState(TILE_SETS[0]);
  const { data: entityData } = useEntities(projectCode, entityCode, {
    params: { fields: ENTITY_FIELDS },
  });

  const onTileSetChange = (tileSetKey: string) => {
    setActiveTileSet(TILE_SETS.find(({ key }) => key === tileSetKey) as typeof TILE_SETS[0]);
  };

  console.log('map data', entityData);
  return (
    <MapContainer>
      <StyledMap>
        <TileLayer tileSetUrl={activeTileSet.url} showAttribution={false} />
        <PolygonLayer entity={entityData} />
        <ZoomControl position="bottomright" />
        <MapLegend />
        <MapWatermark />
      </StyledMap>
      <MapOverlaySelector />
      <TilePickerWrapper>
        <TilePicker tileSets={TILE_SETS} activeTileSet={activeTileSet} onChange={onTileSetChange} />
      </TilePickerWrapper>
    </MapContainer>
  );
};
