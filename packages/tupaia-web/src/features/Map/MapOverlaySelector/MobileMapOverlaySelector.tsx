/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';
import { Button } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT } from '../../../constants';
import { MapOverlayList } from './MapOverlayList';
import { MapOverlaySelectorTitle } from './MapOverlaySelectorTitle';

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
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
  text-align: left;
  background-color: ${({ theme }) => theme.overlaySelector.menuBackground};
  position: relative;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.overlaySelector.menuBackground};
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
  height: ${({ $expanded }) => ($expanded ? '95vh' : '0')};
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

interface MobileMapOverlaySelectorProps {
  overlayLibraryOpen: boolean;
  toggleOverlayLibrary: () => void;
}

export const MobileMapOverlaySelector = ({
  overlayLibraryOpen,
  toggleOverlayLibrary,
}: MobileMapOverlaySelectorProps) => {
  return (
    <Wrapper>
      {!overlayLibraryOpen && (
        <ExpandButton onClick={toggleOverlayLibrary} aria-controls="overlay-selector">
          <span>
            <ExpandButtonLabel>Map Overlay</ExpandButtonLabel>
            <MapOverlaySelectorTitle />
          </span>
          <ArrowWrapper>
            <ArrowForwardIos />
          </ArrowWrapper>
        </ExpandButton>
      )}
      <OverlayMenu
        $expanded={overlayLibraryOpen}
        aria-expanded={overlayLibraryOpen}
        id="overlay-selector"
      >
        <OverlayLibraryHeaderButton onClick={toggleOverlayLibrary} aria-controls="overlay-selector">
          <ArrowWrapper>
            <ArrowBackIos />
          </ArrowWrapper>
          <OverlayLibraryHeader>Overlay Library</OverlayLibraryHeader>
        </OverlayLibraryHeaderButton>
        <OverlayListWrapper>
          <MapOverlayList />
        </OverlayListWrapper>
      </OverlayMenu>
    </Wrapper>
  );
};
