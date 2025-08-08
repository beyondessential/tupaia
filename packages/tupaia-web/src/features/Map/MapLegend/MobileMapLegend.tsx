import React, { ReactNode, useState } from 'react';
import { Close, ExpandLess } from '@material-ui/icons';
import { Button, IconButton } from '@tupaia/ui-components';
import styled, { css } from 'styled-components';
import { MOBILE_BREAKPOINT } from '../../../constants';

const PositionStyles = css`
  position: absolute;
  right: 0;
  margin-right: 0.8rem;
  margin-bottom: 0.8rem;
  bottom: 100%;
  z-index: 1;
  pointer-events: auto;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const MapLegendExpandButton = styled(Button)`
  ${PositionStyles};
  text-transform: none;
  font-size: 0.75rem;
  padding: 0.25rem 0.8rem 0.25rem 0.4rem;
  background-color: ${({ theme }) => theme.palette.overlaySelector.mobile};

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const ExpandedLegend = styled.div`
  ${PositionStyles};
  background-color: ${({ theme }) => theme.palette.overlaySelector.mobile};
  border-radius: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  > div {
    background-color: inherit;
  }
`;

const ExpandIcon = styled(ExpandLess)`
  font-size: 1.75rem;
  margin-right: 0.25rem;
`;

const CloseButton = styled(IconButton).attrs({
  color: 'default',
})`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.8rem;
`;

export const MobileMapLegend = ({ children }: { children: ReactNode }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  return (
    <>
      {expanded ? (
        <ExpandedLegend>
          <CloseButton onClick={toggleExpanded} aria-label="Close legend">
            <Close />
          </CloseButton>
          {children}
        </ExpandedLegend>
      ) : (
        <MapLegendExpandButton onClick={toggleExpanded}>
          <ExpandIcon />
          Map Legend
        </MapLegendExpandButton>
      )}
    </>
  );
};
