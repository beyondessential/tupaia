/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { ArrowBack, ArrowForwardIos } from '@material-ui/icons';
import { Button } from '@tupaia/ui-components';
import { ErrorBoundary } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT, TOP_BAR_HEIGHT_MOBILE } from '../../../constants';
import { MapOverlayList } from './MapOverlayList';
import { MapOverlaySelectorTitle } from './MapOverlaySelectorTitle';
import { MapOverlayDatePicker } from './MapOverlayDatePicker';

const Wrapper = styled.div`
  width: 100%;
  z-index: 1;
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
  height: ${({ $expanded }) => ($expanded ? `calc(100vh - ${TOP_BAR_HEIGHT_MOBILE})` : '0')};
  transition: height 0.3s ease-in-out;
  width: 100%;
  position: absolute;
  bottom: 0;
  background-color: ${({ theme }) => theme.mobile.background};
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
  return (
    <ErrorBoundary>
      <Wrapper>
        {!overlayLibraryOpen && (
          <ButtonWrapper>
            <MapOverlayDatePicker />
            <ExpandButton onClick={toggleOverlayLibrary} aria-controls="overlay-selector">
              <span>
                <ExpandButtonLabel>Map Overlay</ExpandButtonLabel>
                <MapOverlaySelectorTitle />
              </span>
              <ArrowWrapper>
                <ArrowForwardIos />
              </ArrowWrapper>
            </ExpandButton>
          </ButtonWrapper>
        )}
        <OverlayMenu
          $expanded={overlayLibraryOpen}
          aria-expanded={overlayLibraryOpen}
          id="overlay-selector"
        >
          <OverlayLibraryHeaderButton
            onClick={toggleOverlayLibrary}
            aria-controls="overlay-selector"
          >
            <ArrowWrapper>
              <ArrowBack />
            </ArrowWrapper>
            <OverlayLibraryHeader>Overlay Library</OverlayLibraryHeader>
          </OverlayLibraryHeaderButton>
          <OverlayListWrapper>
            <MapOverlayList />
          </OverlayListWrapper>
        </OverlayMenu>
      </Wrapper>
    </ErrorBoundary>
  );
};
