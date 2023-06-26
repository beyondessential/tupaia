/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TileLayer, LeafletMap, ZoomControl, TilePicker } from '@tupaia/ui-map-components';
import {
  TRANSPARENT_BLACK,
  TILE_SETS,
  MOBILE_BREAKPOINT,
  URL_SEARCH_PARAMS,
} from '../../constants';
import { MapWatermark } from './MapWatermark';
import { MapLegend } from './MapLegend';
import { MapOverlaySelector } from './MapOverlaySelector';
import { useMapOverlays } from '../../api/queries';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { flattenMapOverlays } from '../../utils';

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
  position: absolute;
  right: 0;
  bottom: 0;
  height: 100%;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;
export const Map = () => {
  const { projectCode, entityCode } = useParams();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const [activeTileSet, setActiveTileSet] = useState(TILE_SETS[0]);
  const { data: mapOverlaysResponse } = useMapOverlays(projectCode, entityCode);

  const onTileSetChange = (tileSetKey: string) => {
    setActiveTileSet(TILE_SETS.find(({ key }) => key === tileSetKey) as typeof TILE_SETS[0]);
  };

  useEffect(() => {
    const updateMapOverlaySearchParams = () => {
      let selectedOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.OVERLAY);
      let selectedOverlayPeriod =
        urlSearchParams.get(URL_SEARCH_PARAMS.OVERLAY_PERIOD) || 'DEFAULT_PERIOD';

      const flattenedOverlays = flattenMapOverlays(mapOverlaysResponse?.mapOverlays || []);
      if (
        !selectedOverlayCode ||
        !flattenedOverlays.find(mapOverlay => mapOverlay.code === selectedOverlayCode)
      ) {
        selectedOverlayCode = flattenedOverlays[0]?.code || '';
        urlSearchParams.set(URL_SEARCH_PARAMS.OVERLAY, selectedOverlayCode);
        urlSearchParams.set(URL_SEARCH_PARAMS.OVERLAY_PERIOD, selectedOverlayPeriod);
      }

      urlSearchParams.set(URL_SEARCH_PARAMS.OVERLAY, selectedOverlayCode);
      urlSearchParams.set(URL_SEARCH_PARAMS.OVERLAY_PERIOD, selectedOverlayPeriod);
      setUrlSearchParams(urlSearchParams.toString(), {
        replace: true,
      });
    };
    updateMapOverlaySearchParams();
  }, [projectCode, entityCode, mapOverlaysResponse]);

  return (
    <MapContainer>
      <StyledMap>
        <TileLayer tileSetUrl={activeTileSet.url} showAttribution={false} />
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
