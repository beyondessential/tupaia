/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { RadioButtonChecked } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import { useParams } from 'react-router';
import { useEntity, useMapOverlays } from '../../../api/queries';
import { MOBILE_BREAKPOINT } from '../../../constants';
import { useMapOverlayMapData } from '../utils';
import { FetchErrorAlert } from '../../../components';

const Wrapper = styled.div<{
  $hasMapOverlays: boolean;
}>`
  border-radius: ${({ $hasMapOverlays }) => ($hasMapOverlays ? '0' : '0 0 5px 5px')};
  .MuiAlert-root {
    padding: 0.6rem 0.8rem;
    margin-top: 1rem;
    p {
      font-size: 0.875rem;
    }
    .MuiAlert-message {
      padding: 0;
    }
    @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
      p {
        font-size: 0.75rem;
      }
    }
  }
`;

const MapOverlayName = styled.span`
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    font-size: 1rem;
  }
`;

const MapOverlayDot = styled(RadioButtonChecked)`
  margin-right: 0.5rem;
  height: 0.8rem;
  width: 0.8rem;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
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
  const { isInitialLoading: isLoadingOverlayData, error, refetch } = useMapOverlayMapData();

  const { data: entity } = useEntity(projectCode, entityCode);
  const isLoading =
    isLoadingMapOverlays || isLoadingOverlayData || (hasMapOverlays && !selectedOverlay?.name);

  return (
    <Wrapper $hasMapOverlays={hasMapOverlays}>
      {isLoading ? (
        <MapOverlayLoader />
      ) : (
        <Typography>
          {hasMapOverlays ? (
            <MapOverlayName>
              <MapOverlayDot /> <span>{selectedOverlay?.name}</span>
            </MapOverlayName>
          ) : (
            `Select an area with valid data. ${
              entity?.name || 'Your current selection'
            } has no map overlays available.`
          )}
        </Typography>
      )}
      {error && <FetchErrorAlert error={error} refetch={refetch} />}
    </Wrapper>
  );
};
