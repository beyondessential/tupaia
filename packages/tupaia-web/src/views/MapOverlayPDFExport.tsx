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
import { useMapOverlays, useProject } from '../api/queries';
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
    // This is to compensate for the pdf resolution scaling the map down to look smaller than what the screen was displaying. We cannot always do this via map zoom, because the map zoom is limited to the tile set zoom levels.
    zoom: 1.5;
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
  max-width: 27rem;
  min-width: 20rem;
  padding-inline: 1.3rem;
  padding-block: 1rem;
  display: flex;
  align-items: center;
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

const LogoWrapper = styled.div`
  width: 5rem;
  height: 5rem;
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline-end: 0.8rem;
`;
const ProjectLogo = styled.img`
  max-width: 100%;
  height: auto;
`;

const TextWrapper = styled.div`
  margin-inline-start: 0.8rem;
  width: calc(100% - 5rem);
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

  const locale = urlSearchParams.get('locale') ?? 'en-AU';

  return { tileset, zoom, center, hiddenValues, period, locale };
};

/**
 * This is the view that gets hit by puppeteer when generating a map overlay PDF.
 */
export const MapOverlayPDFExport = () => {
  const { projectCode, entityCode } = useParams();

  const { data: project } = useProject(projectCode);

  const { selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { tileset, zoom, center, hiddenValues, locale } = useExportParams();

  const { startDate, endDate } = useDateRanges(
    URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD,
    selectedOverlay,
  );

  const getDateRangeString = () => {
    if (startDate && endDate) {
      const startDateString = moment(startDate).toDate().toLocaleDateString(locale);
      const endDateString = moment(endDate).toDate().toLocaleDateString(locale);
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
        <LogoWrapper>
          <ProjectLogo src={project?.logoUrl || '/tupaia-logo-dark.svg'} alt={project?.name} />
        </LogoWrapper>
        <TextWrapper>
          <MapOverlayName>{selectedOverlay?.name}</MapOverlayName>
          {dateRangeString && <LatestDataText>Date of data: {dateRangeString}</LatestDataText>}
        </TextWrapper>
      </MapOverlayInfoContainer>
      <LegendWrapper>
        <Legend hiddenValues={hiddenValues} setValueHidden={() => {}} isExport />
      </LegendWrapper>
    </Parent>
  );
};
