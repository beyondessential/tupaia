/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { Close, ExpandLess } from '@material-ui/icons';
import { Button, IconButton } from '@tupaia/ui-components';
import styled from 'styled-components';

const ExpandableMapLegendWrapper = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  @media screen and (min-width: ${({ theme }) => theme.mobile.threshold}) {
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
  background-color: ${({ theme }) => theme.mobile.background};
  height: 20rem;
  width: 12rem;
  border-radius: 0.5rem;
`;

const CloseButton = styled(IconButton).attrs({
  color: 'default',
})`
  position: absolute;
  top: 0;
  right: 0;
`;

export const ExpandableMapLegend = () => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  return (
    <ExpandableMapLegendWrapper>
      {expanded ? (
        <ExpandedLegend>
          <CloseButton onClick={toggleExpanded} aria-label="Close legend">
            <Close />
          </CloseButton>
        </ExpandedLegend>
      ) : (
        <MapLegendExpandButton onClick={toggleExpanded}>
          <ExpandIcon />
          Map Legend
        </MapLegendExpandButton>
      )}
    </ExpandableMapLegendWrapper>
  );
};
