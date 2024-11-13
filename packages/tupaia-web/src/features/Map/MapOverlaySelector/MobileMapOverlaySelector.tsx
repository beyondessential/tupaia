/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { Typography } from '@material-ui/core';
import { ArrowBack, ArrowForwardIos } from '@material-ui/icons';
import { Button } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT } from '../../../constants';
import { getFriendlyEntityType, getMobileTopBarHeight } from '../../../utils';
import { useEntity, useMapOverlays } from '../../../api/queries';
import { MapOverlayList } from './MapOverlayList';
import { MapOverlaySelectorTitle } from './MapOverlaySelectorTitle';
import { MapOverlayDatePicker } from './MapOverlayDatePicker';

const Wrapper = styled.div`
  width: 100%;
  z-index: 11; // above the map+watermark
  pointer-events: auto;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const ExpandButton = styled(Button)`
  display: flex;
  justify-content: space-between;
  text-transform: none;
  align-items: center;
  border-radius: 0;
  padding: 1rem;
  background-color: ${({ theme }) => theme.palette.overlaySelector.menuBackground};
  position: relative;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.palette.overlaySelector.menuBackground};
  }
`;

const ArrowWrapper = styled.div`
  display: flex;
  align-items: center;
`;
const OverlayLibraryHeaderButton = styled(ExpandButton)`
  font-size: 1.125rem;
  text-align: center;
  padding: 1rem;
  width: 100%;
`;

const OverlayLibraryHeader = styled.span`
  width: 100%;
`;

const OverlayListWrapper = styled.div`
  padding: 1rem;
`;

const OverlayMenu = styled.div<{
  $expanded: boolean;
}>`
  // we use dvh here to make up for mobile viewports which have system ui bars (e.g. forward button, address bar etc) that are not accounted for in vh units. Support for this is widespread for modern browsers (https://caniuse.com/viewport-unit-variants), especially relative to usage.
  height: ${({ $expanded }) => ($expanded ? `calc(100dvh - ${getMobileTopBarHeight()})` : '0')};
  transition: height 0.3s ease-in-out;
  width: 100%;
  position: fixed;
  bottom: 0;
  background-color: ${({ theme }) => theme.palette.overlaySelector.mobile};
  overflow: auto;
  ${OverlayLibraryHeaderButton} {
    display: ${({ $expanded }) => ($expanded ? 'flex' : 'none')};
  }
  > * {
    display: ${({ $expanded }) => ($expanded ? 'flex' : 'none')};
  }
`;

const MapOverlayTitle = styled(Typography).attrs({
  variant: 'h2',
})`
  padding-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const TitleWrapper = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.palette.overlaySelector.menuBackground};
  padding: 1rem;
  display: flex;
  justify-content: space-between;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  // add padding around the date picker when present
  > div {
    padding: 1rem;
  }
`;

interface MobileMapOverlaySelectorProps {
  overlayLibraryOpen: boolean;
  toggleOverlayLibrary: () => void;
}

export const MobileMapOverlaySelector = ({
  overlayLibraryOpen,
  toggleOverlayLibrary,
}: MobileMapOverlaySelectorProps) => {
  const { projectCode, entityCode } = useParams();
  const { data: entity } = useEntity(projectCode, entityCode, true);
  const { hasMapOverlays } = useMapOverlays(projectCode, entityCode);

  const friendlyEntityType = getFriendlyEntityType(entity?.type);

  return (
    <Wrapper>
      <Container>
        <MapOverlayDatePicker />
        <TitleWrapper>
          <div>
            <MapOverlayTitle>Map Overlay</MapOverlayTitle>
            <MapOverlaySelectorTitle />
          </div>
          {hasMapOverlays && (
            <ExpandButton
              onClick={toggleOverlayLibrary}
              aria-controls="overlay-selector"
              title={`${overlayLibraryOpen ? 'Hide' : 'Show'} overlay library`}
            >
              <ArrowWrapper>
                <ArrowForwardIos />
              </ArrowWrapper>
            </ExpandButton>
          )}
        </TitleWrapper>
      </Container>
      <OverlayMenu
        $expanded={overlayLibraryOpen}
        aria-expanded={overlayLibraryOpen}
        id="overlay-selector"
      >
        <OverlayLibraryHeaderButton onClick={toggleOverlayLibrary} aria-controls="overlay-selector">
          <ArrowWrapper>
            <ArrowBack />
          </ArrowWrapper>
          <OverlayLibraryHeader>
            Overlay Library {friendlyEntityType && `(${friendlyEntityType})`}
          </OverlayLibraryHeader>
        </OverlayLibraryHeaderButton>
        <OverlayListWrapper>
          {/* Use the entity code as a key so that the local state of the MapOverlayList resets between entities */}
          <MapOverlayList key={entityCode} toggleOverlayLibrary={toggleOverlayLibrary} />
        </OverlayListWrapper>
      </OverlayMenu>
    </Wrapper>
  );
};
