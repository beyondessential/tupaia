/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { Accordion, Typography, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { ExpandMore, Layers } from '@material-ui/icons';
import { periodToMoment } from '@tupaia/utils';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../../constants';
import { Entity } from '../../../types';
import { useMapOverlayReport, useMapOverlays } from '../../../api/queries';
import { MapOverlayList } from './MapOverlayList';
import { MapOverlaySelectorTitle } from './MapOverlaySelectorTitleSection';
import { useDateRanges } from '../../../utils';

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
  padding: 0.9rem 1rem;
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
  pointer-events: auto;
`;

const OverlayLibraryAccordion = styled(Accordion)`
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  background-color: ${({ theme }) => theme.overlaySelector.menuBackground};
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

interface DesktopMapOverlaySelectorProps {
  entityName?: Entity['name'];
  overlayLibraryOpen: boolean;
  toggleOverlayLibrary: () => void;
}

export const DesktopMapOverlaySelector = ({
  overlayLibraryOpen,
  toggleOverlayLibrary,
}: DesktopMapOverlaySelectorProps) => {
  const { projectCode, entityCode } = useParams();
  const { hasMapOverlays, selectedOverlay } = useMapOverlays(projectCode, entityCode);
  const { startDate, endDate } = useDateRanges(
    URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD,
    selectedOverlay,
  );
  const { data: mapOverlayData } = useMapOverlayReport(
    projectCode,
    entityCode,
    selectedOverlay?.code,
    selectedOverlay?.legacy,
    {
      startDate,
      endDate,
    },
  );

  return (
    <Wrapper>
      <Header>
        <Heading>Map Overlays</Heading>
      </Header>
      <Container>
        <MapOverlaySelectorTitle />
        {hasMapOverlays && (
          <OverlayLibraryAccordion
            expanded={overlayLibraryOpen}
            onChange={toggleOverlayLibrary}
            square
          >
            <OverlayLibraryHeader
              expandIcon={<ExpandMore />}
              aria-controls="overlay-library-content"
              id="overlay-library-header"
            >
              <OverlayLibraryIcon />
              <OverlayLibraryTitle>Overlay library</OverlayLibraryTitle>
            </OverlayLibraryHeader>
            <OverlayLibraryContentWrapper>
              <OverlayLibraryContentContainer>
                <MapOverlayList />
              </OverlayLibraryContentContainer>
            </OverlayLibraryContentWrapper>
          </OverlayLibraryAccordion>
        )}
        {mapOverlayData?.period?.latestAvailable && (
          <LatestDataContainer>
            <LatestDataText>
              Latest overlay data:{' '}
              {periodToMoment(mapOverlayData?.period?.latestAvailable).format('DD/MM/YYYY')}
            </LatestDataText>
          </LatestDataContainer>
        )}
      </Container>
    </Wrapper>
  );
};
