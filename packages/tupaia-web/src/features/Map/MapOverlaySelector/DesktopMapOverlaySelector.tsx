/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { periodToMoment } from '@tupaia/utils';
import { Tooltip } from '@tupaia/ui-components';
import { IconButton } from '@tupaia/ui-components';
import { ArrowDropDown, Layers, Assignment } from '@material-ui/icons';
import { Accordion, Typography, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { MapTableModal } from './MapTableModal';
import { MapOverlayList } from './MapOverlayList';
import { MapOverlayDatePicker } from './MapOverlayDatePicker';
import { MapOverlaySelectorTitle } from './MapOverlaySelectorTitle';
import { useMapOverlayTableData } from '../utils';
import { Entity } from '../../../types';
import { useMapOverlays } from '../../../api/queries';
import { MOBILE_BREAKPOINT } from '../../../constants';
import { useGAEffect } from '../../../utils';

const MapTableButton = styled(IconButton)`
  margin: -0.625rem -0.625rem -0.625rem 0;
  padding: 0.5rem 0.325rem 0.5rem 0.75rem;
  color: white;
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

const TableAssignmentIcon = styled(Assignment)`
  margin-right: 0.5rem;
  width: 1.2rem;
  cursor: pointer;
`;

const Container = styled(MaxHeightContainer)`
  border-radius: 0 0 5px 5px;
  // Set pointer events on the container rather than higher up so that it only applies to the open menu
  pointer-events: auto;
`;

const TitleWrapper = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.overlaySelector.overlayNameBackground};
  // Add padding between the title and the date picker when both are present
  div + div {
    padding-top: 0.5rem;
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
  const { period } = useMapOverlayTableData();
  const [mapModalOpen, setMapModalOpen] = useState(false);
  // This only fires when the selected overlay changes. Because this is always rendered, as is the mobile overlay selector, we only need this in one place
  useGAEffect('MapOverlays', 'Change', selectedOverlay?.name);
  const toggleMapTableModal = () => {
    setMapModalOpen(!mapModalOpen);
  };

  return (
    <>
      {mapModalOpen && <MapTableModal onClose={toggleMapTableModal} />}
      <Wrapper>
        <Header>
          <Heading>Map Overlays</Heading>
          {selectedOverlay && (
            <MapTableButton onClick={toggleMapTableModal}>
              <Tooltip arrow interactive placement="top" title="Generate Report">
                <TableAssignmentIcon />
              </Tooltip>
            </MapTableButton>
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
                  <MapOverlayList />
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
