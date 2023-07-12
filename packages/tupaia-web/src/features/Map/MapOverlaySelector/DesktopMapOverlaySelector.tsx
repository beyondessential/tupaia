/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { Accordion, Typography, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { ExpandMore, Layers } from '@material-ui/icons';
import { Skeleton as MuiSkeleton } from '@material-ui/lab';
import { periodToMoment } from '@tupaia/utils';
import { MOBILE_BREAKPOINT } from '../../../constants';
import { Entity } from '../../../types';
import { useMapOverlayData, useMapOverlays } from '../../../api/queries';

import { MapOverlayList } from './MapOverlayList';

const MaxHeightContainer = styled.div`
  flex: 1;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled(MaxHeightContainer)`
  pointer-events: auto;
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
`;

const MapOverlayNameContainer = styled.div<{
  $hasMapOverlays: boolean;
}>`
  padding: 1.3rem 1rem 1rem 1.125rem;
  background-color: ${({ theme }) => theme.overlaySelector.overlayNameBackground};
  border-radius: ${({ $hasMapOverlays }) => ($hasMapOverlays ? '0' : '0 0 5px 5px')};
`;

const MapOverlayName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Skeleton = styled(MuiSkeleton)`
  transform: scale(1, 1);
  ::after {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  }
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
  entityName,
  overlayLibraryOpen,
  toggleOverlayLibrary,
}: DesktopMapOverlaySelectorProps) => {
  const {
    hasMapOverlays,
    isLoadingMapOverlays,
    selectedOverlayCode,
    selectedOverlay,
  } = useMapOverlays();

  const { projectCode, entityCode } = useParams();
  const { data: mapOverlayData } = useMapOverlayData(projectCode, entityCode, selectedOverlayCode);

  return (
    <Wrapper>
      <Header>
        <Heading>Map Overlays</Heading>
      </Header>
      <Container>
        <MapOverlayNameContainer $hasMapOverlays={hasMapOverlays}>
          {isLoadingMapOverlays ? (
            <Skeleton animation="wave" width={200} height={20} />
          ) : (
            <Typography>
              {hasMapOverlays ? (
                <MapOverlayName>{selectedOverlay?.name}</MapOverlayName>
              ) : (
                `Select an area with valid data. ${
                  entityName && `${entityName} has no map overlays available.`
                }`
              )}
            </Typography>
          )}
        </MapOverlayNameContainer>
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
