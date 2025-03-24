import React, { ReactNode } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { LeafletMap, TileLayer, getAutoTileSet } from '@tupaia/ui-map-components';
import { MapOverlaysLayer, Legend } from '../features/Map';
import { useMapOverlays, useProject } from '../api/queries';
import { DEFAULT_PERIOD_PARAM_STRING, URL_SEARCH_PARAMS } from '../constants';
import { useDateRanges } from '../utils';

const Parent = styled.div`
  height: 210mm;
  width: 297mm;
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
  inset-block-end: 2.8rem;
  inset-inline-start: 2.8rem;
  position: absolute;
`;

const MapOverlayInfoContainer = styled.div`
  align-items: center;
  background-color: white;
  border: 1pt solid ${props => props.theme.palette.divider};
  display: flex;
  inset-block-start: 1.3rem;
  inset-inline-start: 2.1rem;
  max-inline-size: 27rem;
  min-inline-size: 20rem;
  padding-block: 1rem;
  padding-inline: 1.3rem;
  position: absolute;
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

const ProjectLogo = styled.img`
  border-inline-end: 1pt solid ${props => props.theme.palette.divider};
  height: 5rem;
  padding-inline-end: 0.8rem;
  object-fit: contain;
  object-position: center;
  width: 5rem;
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
  const zoom = urlZoom ? Number.parseInt(urlZoom) : 5;
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

  const getDateRangeString = (): ReactNode => {
    if (startDate && endDate) {
      const startDateString = moment(startDate).toDate().toLocaleDateString(locale);
      const endDateString = moment(endDate).toDate().toLocaleDateString(locale);
      return (
        <>
          {startDateString}&nbsp;&ndash; {endDateString}
        </>
      );
    }
    return null;
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
        <ProjectLogo src={project?.logoUrl || '/tupaia-logo-dark.svg'} alt={project?.name} />
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
