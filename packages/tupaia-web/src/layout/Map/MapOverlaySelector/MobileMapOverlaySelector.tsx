/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';
import { Button } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT } from '../../../constants';

// Placeholder for MapOverlaySelector component
const Wrapper = styled.div`
  width: 100%;
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
  background-color: ${({ theme }) => theme.overlaySelector.menuBackground};
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

const OverlayMenu = styled.div<{
  $expanded: boolean;
}>`
  height: ${({ $expanded }) => ($expanded ? '100%' : '0')};
  transition: height 0.3s ease-in-out;
  width: 100%;
  position: absolute;
  bottom: 0;
  background-color: ${({ theme }) => theme.mobile.background};
  ${OverlayLibraryHeaderButton} {
    display: ${({ $expanded }) => ($expanded ? 'block' : 'none')};
  }
`;

export const MobileMapOverlaySelector = () => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded(!expanded);
  return (
    <Wrapper>
      {!expanded && (
        <ExpandButton onClick={toggleExpanded} aria-controls="overlay-selector">
          Map Overlay
          <ArrowWrapper>
            <ArrowForwardIos />
          </ArrowWrapper>
        </ExpandButton>
      )}
      <OverlayMenu $expanded={expanded} aria-expanded={expanded} id="overlay-selector">
        <OverlayLibraryHeaderButton onClick={toggleExpanded} aria-controls="overlay-selector">
          <ArrowWrapper>
            <ArrowBackIos />
          </ArrowWrapper>
          <OverlayLibraryHeader>Overlay Library</OverlayLibraryHeader>
        </OverlayLibraryHeaderButton>
      </OverlayMenu>
    </Wrapper>
  );
};
