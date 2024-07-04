/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { periodToMoment } from '@tupaia/utils';
import { Tooltip, IconButton } from '@tupaia/ui-components';
import { LegendProps } from '@tupaia/ui-map-components';
import { ArrowDropDown, Layers, Assignment, GetApp } from '@material-ui/icons';
import {
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@material-ui/core';
import { useMapOverlayMapData, useMapContext } from '../utils';
import { Entity } from '../../../types';
import { useExportMapOverlay } from '../../../api/mutations';
import { useEntity, useMapOverlays, useProject } from '../../../api/queries';
import {
  DEFAULT_PERIOD_PARAM_STRING,
  MOBILE_BREAKPOINT,
  URL_SEARCH_PARAMS,
} from '../../../constants';
import { useGAEffect } from '../../../utils';
import { MapTableModal } from './MapTableModal';
import { MapOverlayList } from './MapOverlayList';
import { MapOverlayDatePicker } from './MapOverlayDatePicker';
import { MapOverlaySelectorTitle } from './MapOverlaySelectorTitle';
import { useSearchParams } from 'react-router-dom';

const MapButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.text.primary};
  padding: 0.1rem;
  & + & {
    margin-inline-start: 0.5rem;
  }
  .MuiSvgIcon-root {
    font-size: 1.3rem;
  }
`;

const MaxHeightContainer = styled.div`
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled(MaxHeightContainer)`
  flex: 1;
  max-width: 21.25rem;
  margin: 0.625rem;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  background-color: ${({ theme }) => theme.palette.secondary.main};
  border-radius: 5px 5px 0 0;
  pointer-events: auto;
`;

const Heading = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Container = styled(MaxHeightContainer)`
  border-radius: 0 0 5px 5px;
  // Set pointer events on the container rather than higher up so that it only applies to the open menu
  pointer-events: auto;
`;

const TitleWrapper = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.palette.overlaySelector.overlayNameBackground};
  // Add padding between the title and the date picker when both are present
  div + div {
    padding-top: 0.5rem;
  }
`;

const OverlayLibraryAccordion = styled(Accordion)`
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  background-color: ${({ theme }) => theme.palette.overlaySelector.menuBackground};
  border-radius: 0 0 5px 5px;
  &:before {
    display: none;
  }
  &.MuiPaper-root.Mui-expanded {
    height: 100%;
    overflow: hidden; // make the accordion conform to the max-height of the parent container, regardless of how much content is present
    > .MuiCollapse-container.MuiCollapse-entered {
      max-height: 100%;
      overflow-y: auto; // scrollable content when accordion is expanded;
    }
  }
`;

const OverlayLibraryIcon = styled(Layers)`
  margin-right: 0.5rem;
  width: 1.2rem;
  .Mui-expanded & {
    fill: ${({ theme }) => theme.palette.secondary.main};
  }
`;

const OverlayLibraryTitle = styled(Typography)`
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const OverlayLibraryHeader = styled(AccordionSummary)`
  margin: 0 !important;
  min-height: unset !important;
  color: rgba(255, 255, 255, 0.6);
  .MuiAccordionSummary-content {
    margin: 0 !important;
    align-items: center;
  }

  &:hover,
  &.Mui-expanded,
  &:focus-visible {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

const OverlayLibraryContentWrapper = styled(AccordionDetails)`
  padding: 0 1rem 1rem;
`;

const OverlayLibraryContentContainer = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  width: 100%;
  padding-top: 1rem;
`;

const LatestDataContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  padding: 0.3rem 0.5rem 0.2rem;
  margin-top: 0.5rem;
`;

const LatestDataText = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1.3;
`;

const LoadingSpinner = styled(CircularProgress).attrs({
  size: 16,
})`
  color: ${({ theme }) => theme.palette.text.primary};
`;

interface DesktopMapOverlaySelectorProps {
  entityName?: Entity['name'];
  overlayLibraryOpen: boolean;
  toggleOverlayLibrary: () => void;
  hiddenValues: LegendProps['hiddenValues'];
  activeTileSet: {
    key: string;
    label: string;
    thumbnail: string;
    url: string;
  };
}

export const DesktopMapOverlaySelector = ({
  overlayLibraryOpen,
  toggleOverlayLibrary,
  hiddenValues,
  activeTileSet,
}: DesktopMapOverlaySelectorProps) => {
  const [urlSearchParams] = useSearchParams();
  const { projectCode, entityCode } = useParams();
  const { hasMapOverlays, selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { data: project } = useProject(projectCode);
  const { data: entity } = useEntity(projectCode, entityCode);
  const { period } = useMapOverlayMapData();
  const { map } = useMapContext();
  const exportFileName = `${project?.name}-${entity?.name}-${selectedOverlay?.code}-map-overlay-export`;
  const { mutate: exportMapOverlay, isLoading: isExporting } = useExportMapOverlay(exportFileName);
  const mapOverlayPeriod =
    urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD) ?? DEFAULT_PERIOD_PARAM_STRING;

  const [mapModalOpen, setMapModalOpen] = useState(false);
  // This only fires when the selected overlay changes. Because this is always rendered, as is the mobile overlay selector, we only need this in one place
  useGAEffect('MapOverlays', 'Change', selectedOverlay?.name);
  const toggleMapTableModal = () => {
    setMapModalOpen(!mapModalOpen);
  };

  const onExportMapOverlay = () => {
    if (!map) throw new Error('Map is not ready');
    exportMapOverlay({
      projectCode,
      entityCode,
      mapOverlayCode: selectedOverlay?.code,
      center: map.getCenter(),
      zoom: map.getZoom(),
      hiddenValues,
      tileset: activeTileSet.url,
      mapOverlayPeriod,
    });
  };

  return (
    <>
      {mapModalOpen && <MapTableModal onClose={toggleMapTableModal} />}
      <Wrapper>
        <Header>
          <Heading>Map Overlays</Heading>
          {selectedOverlay && (
            <div>
              <MapButton onClick={onExportMapOverlay} disabled={isExporting || !map}>
                {isExporting ? (
                  <LoadingSpinner />
                ) : (
                  <Tooltip
                    arrow
                    placement="top"
                    title={isExporting ? '' : 'Export map overlay as PDF'}
                  >
                    <GetApp />
                  </Tooltip>
                )}
              </MapButton>
              <Tooltip arrow interactive placement="top" title="Generate report">
                <MapButton onClick={toggleMapTableModal}>
                  <Assignment />
                </MapButton>
              </Tooltip>
            </div>
          )}
        </Header>
        <Container>
          <TitleWrapper>
            <MapOverlaySelectorTitle />
            <MapOverlayDatePicker />
          </TitleWrapper>
          {hasMapOverlays && (
            <OverlayLibraryAccordion
              expanded={overlayLibraryOpen}
              onChange={toggleOverlayLibrary}
              square
            >
              <OverlayLibraryHeader
                expandIcon={<ArrowDropDown />}
                aria-controls="overlay-library-content"
                id="overlay-library-header"
              >
                <OverlayLibraryIcon />
                <OverlayLibraryTitle>Overlay library</OverlayLibraryTitle>
              </OverlayLibraryHeader>
              <OverlayLibraryContentWrapper>
                <OverlayLibraryContentContainer>
                  {/* Use the entity code as a key so that the local state of the MapOverlayList resets between entities */}
                  <MapOverlayList key={entityCode} />
                </OverlayLibraryContentContainer>
              </OverlayLibraryContentWrapper>
            </OverlayLibraryAccordion>
          )}
          {period?.latestAvailable && (
            <LatestDataContainer>
              <LatestDataText>
                Latest overlay data: {periodToMoment(period?.latestAvailable).format('DD/MM/YYYY')}
              </LatestDataText>
            </LatestDataContainer>
          )}
        </Container>
      </Wrapper>
    </>
  );
};
