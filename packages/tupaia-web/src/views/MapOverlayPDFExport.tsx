/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { LeafletMap, TileLayer, getAutoTileSet } from '@tupaia/ui-map-components';
import { A4_PAGE_HEIGHT_PX, A4_PAGE_WIDTH_PX } from '@tupaia/ui-components';
import { MapOverlaysLayer, Legend } from '../features/Map';
import { useMapOverlays } from '../api/queries';
import { DEFAULT_PERIOD_PARAM_STRING, URL_SEARCH_PARAMS } from '../constants';
import { useDateRanges } from '../utils';

const Parent = styled.div`
  // reverse the width and height to make the map landscape
  height: ${A4_PAGE_WIDTH_PX - 2}px;
  width: ${A4_PAGE_HEIGHT_PX}px;
  position: relative;
  overflow: hidden;
`;

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
`;

const LegendWrapper = styled.div`
  position: absolute;
  bottom: 2.8rem;
  left: 2.8rem;
`;

const MapOverlayInfoContainer = styled.div`
  position: absolute;
  top: 1.3rem;
  left: 2.1rem;
  background-color: white;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  width: 20rem;
  padding-inline: 1.3rem;
  padding-block: 1rem;
`;

const MapOverlayInfoText = styled(Typography)`
  font-size: 0.875rem;
  font-weight: 500;
`;

const MapOverlayName = styled(MapOverlayInfoText).attrs({
  variant: 'h2',
})`
  color: black;
  font-size: 1rem;
`;

const LatestDataText = styled(MapOverlayInfoText)`
  color: ${({ theme }) => theme.palette.divider};
  margin-block-start: 0.4rem;
`;

const useExportParams = () => {
  const [urlSearchParams] = useSearchParams();

  const initialTileSet = getAutoTileSet();
  const tileset = urlSearchParams.get('tileset') ?? initialTileSet.url;
  const urlCenter = urlSearchParams.get('center');
  const urlZoom = urlSearchParams.get('zoom');
  const zoom = urlZoom ? parseInt(urlZoom) : 5;
  const center = urlCenter ? JSON.parse(urlCenter) : undefined;
  const urlHiddenValues = urlSearchParams.get('hiddenValues');
  const hiddenValues = urlHiddenValues ? JSON.parse(urlHiddenValues) : undefined;
  const period =
    urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD) ?? DEFAULT_PERIOD_PARAM_STRING;

  return { tileset, zoom, center, hiddenValues, period };
};

/**
 * This is the view that gets hit by puppeteer when generating a map overlay PDF.
 */
export const MapOverlayPDFExport = () => {
  const { projectCode, entityCode } = useParams();

  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { tileset, zoom, center, hiddenValues } = useExportParams();

  const { startDate, endDate } = useDateRanges(
    URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD,
    selectedOverlay,
  );

  const getDateRangeString = () => {
    if (startDate && endDate) {
      const startDateString = moment(startDate).toDate().toLocaleDateString();
      const endDateString = moment(endDate).toDate().toLocaleDateString();
      return `${startDateString} - ${endDateString}`;
    }
    return '';
  };

  const dateRangeString = getDateRangeString();

  return (
    <Parent>
      <MapContainer>
        <StyledMap shouldSnapToPosition center={center} zoom={zoom}>
          <TileLayer tileSetUrl={tileset} showAttribution={false} />
          <MapOverlaysLayer hiddenValues={hiddenValues} />
        </StyledMap>
      </MapContainer>
      <MapOverlayInfoContainer>
        <MapOverlayName>{selectedOverlay?.name}</MapOverlayName>
        {dateRangeString && <LatestDataText>Date of data: {dateRangeString}</LatestDataText>}
      </MapOverlayInfoContainer>
      <LegendWrapper>
        <Legend hiddenValues={hiddenValues} setValueHidden={() => {}} isExport />
      </LegendWrapper>
    </Parent>
  );
};
