/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { ArrowBack, ArrowForwardIos } from '@material-ui/icons';
import { Button } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT } from '../../../constants';
import { MapOverlayList } from './MapOverlayList';
import { MapOverlaySelectorTitle } from './MapOverlaySelectorTitle';
import { MapOverlayDatePicker } from './MapOverlayDatePicker';
import { getMobileTopBarHeight } from '../../../utils/getTopBarHeight';
import { useMapOverlays } from '../../../api/queries';
import { useParams } from 'react-router';

const Wrapper = styled.div`
  width: 100%;
  z-index: 11; // above the map+watermark
  pointer-events: auto;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const ExpandButton = styled(Button)`
  width: 100%;
  display: flex;
  justify-content: space-between;
  text-transform: none;
  align-items: center;
  font-size: 0.875rem;
  border-radius: 0;
  padding: 1rem;
  text-align: left;
  background-color: ${({ theme }) => theme.overlaySelector.menuBackground};
  position: relative;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.overlaySelector.menuBackground};
  }
  p {
    margin-left: 1rem;
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
  background-color: ${({ theme }) => theme.mobile.background};

  overflow: auto;

  ${OverlayLibraryHeaderButton} {
    display: ${({ $expanded }) => ($expanded ? 'flex' : 'none')};
  }
  > * {
    display: ${({ $expanded }) => ($expanded ? 'flex' : 'none')};
  }
`;

const ExpandButtonLabel = styled.div`
  padding-bottom: 0.5rem;
`;

const ButtonWrapper = styled.div`
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
  const { hasMapOverlays } = useMapOverlays(projectCode, entityCode);

  return (
    <Wrapper>
      {!overlayLibraryOpen && (
        <ButtonWrapper>
          <MapOverlayDatePicker />
          <ExpandButton
            onClick={hasMapOverlays ? toggleOverlayLibrary : undefined}
            aria-controls="overlay-selector"
          >
            <span>
              <ExpandButtonLabel>Map Overlay</ExpandButtonLabel>
              <MapOverlaySelectorTitle />
            </span>
            {hasMapOverlays && (
              <ArrowWrapper>
                <ArrowForwardIos />
              </ArrowWrapper>
            )}
          </ExpandButton>
        </ButtonWrapper>
      )}
      <OverlayMenu
        $expanded={overlayLibraryOpen}
        aria-expanded={overlayLibraryOpen}
        id="overlay-selector"
      >
        <OverlayLibraryHeaderButton onClick={toggleOverlayLibrary} aria-controls="overlay-selector">
          <ArrowWrapper>
            <ArrowBack />
          </ArrowWrapper>
          <OverlayLibraryHeader>Overlay Library</OverlayLibraryHeader>
        </OverlayLibraryHeaderButton>
        <OverlayListWrapper>
          {/* Use the entity code as a key so that the local state of the MapOverlayList resets between entities */}
          <MapOverlayList key={entityCode} toggleOverlayLibrary={toggleOverlayLibrary} />
        </OverlayListWrapper>
      </OverlayMenu>
    </Wrapper>
  );
};
