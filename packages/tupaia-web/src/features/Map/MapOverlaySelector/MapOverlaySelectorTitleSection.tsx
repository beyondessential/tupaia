/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useParams } from 'react-router';
import { MapOverlayDatePicker } from './MapOverlayDatePicker';
import { useEntity, useMapOverlays } from '../../../api/queries';

const Wrapper = styled.div<{
  $hasMapOverlays: boolean;
}>`
  padding: 1.3rem 1rem 1rem 1.125rem;
  background-color: ${({ theme }) => theme.overlaySelector.overlayNameBackground};
  border-radius: ${({ $hasMapOverlays }) => ($hasMapOverlays ? '0' : '0 0 5px 5px')};
`;

const MapOverlayName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const MapOverlayLoader = styled(Skeleton).attrs({
  animation: 'wave',
  width: 200,
  height: 20,
})`
  transform: scale(1, 1);
  ::after {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  }
`;

export const MapOverlaySelectorTitle = () => {
  const { projectCode, entityCode } = useParams();
  const { hasMapOverlays, isLoadingMapOverlays, selectedOverlay } = useMapOverlays(
    projectCode,
    entityCode,
  );

  const { data: entity } = useEntity(projectCode, entityCode);
  return (
    <Wrapper $hasMapOverlays={hasMapOverlays}>
      {isLoadingMapOverlays ? (
        <MapOverlayLoader />
      ) : (
        <Typography>
          {hasMapOverlays ? (
            <MapOverlayName>{selectedOverlay?.name}</MapOverlayName>
          ) : (
            `Select an area with valid data. ${
              entity?.name ? `${entity?.name} has no map overlays available.` : ''
            }`
          )}
        </Typography>
      )}
      <MapOverlayDatePicker />
    </Wrapper>
  );
};
