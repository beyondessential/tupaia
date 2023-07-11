/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Close, ExpandLess } from '@material-ui/icons';
import { Button, IconButton } from '@tupaia/ui-components';
import styled from 'styled-components';
import { MOBILE_BREAKPOINT } from '../../../constants';

const Wrapper = styled.div`
  position: absolute;
  pointer-events: auto;
  bottom: 0.8rem;
  right: 1rem;
  padding: 0;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const MapLegendExpandButton = styled(Button)`
  text-transform: none;
  font-size: 0.75rem;
  padding: 0.25rem 0.8rem 0.25rem 0.4rem;
  background-color: ${({ theme }) => theme.mobile.background};
`;

const ExpandIcon = styled(ExpandLess)`
  font-size: 1.75rem;
  margin-right: 0.25rem;
`;

const ExpandedLegend = styled.div`
  display: block;
  background-color: ${({ theme }) => theme.mobile.background};
  min-height: 10rem;
  min-width: 10rem;
  border-radius: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
`;

const CloseButton = styled(IconButton).attrs({
  color: 'default',
})`
  position: absolute;
  top: 0;
  right: 0;
`;

export const MobileMapLegend = ({ Legend }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  return (
    <Wrapper>
      {expanded ? (
        <ExpandedLegend>
          <CloseButton onClick={toggleExpanded} aria-label="Close legend">
            <Close />
          </CloseButton>
          {Legend}
        </ExpandedLegend>
      ) : (
        <MapLegendExpandButton onClick={toggleExpanded}>
          <ExpandIcon />
          Map Legend
        </MapLegendExpandButton>
      )}
    </Wrapper>
  );
};
