/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { ErrorBoundary } from '@tupaia/ui-components';
import { Legend as LegendComponent, LegendProps } from '@tupaia/ui-map-components';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../../constants';
import { useMapOverlayMapData } from '../utils';
import { MobileMapLegend } from './MobileMapLegend';

const DesktopWrapper = styled.div`
  pointer-events: auto;
  margin: 0.4rem 0.625rem 1.5rem 0.625rem;
  font-size: 0.875rem;
  z-index: 1;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const SeriesDivider = styled.div`
  height: 0;
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme }) => (theme.palette.type === 'light' ? '#00000022' : '#ffffff22')};
  width: calc(100% - 2rem);
  margin: 0.3rem auto 0.2rem;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

export const Legend = ({ hiddenValues, setValueHidden, isExport }: LegendProps) => {
  const [urlSearchParams] = useSearchParams();
  const selectedOverlay = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const { isLoading, isFetched, ...overlayReportData } = useMapOverlayMapData();

  if (!selectedOverlay || !overlayReportData || isLoading) {
    return null;
  }
  return (
    <LegendComponent
      measureInfo={{ [selectedOverlay]: overlayReportData }}
      setValueHidden={setValueHidden}
      hiddenValues={hiddenValues}
      currentMapOverlayCodes={[selectedOverlay]}
      displayedMapOverlayCodes={[selectedOverlay]}
      SeriesDivider={isExport ? undefined : SeriesDivider}
      isExport={isExport}
    />
  );
};

export const MapLegend = ({ hiddenValues, setValueHidden }: LegendProps) => {
  return (
    <ErrorBoundary>
      <MobileMapLegend>
        <Legend hiddenValues={hiddenValues} setValueHidden={setValueHidden} />
      </MobileMapLegend>
      <DesktopWrapper>
        <Legend hiddenValues={hiddenValues} setValueHidden={setValueHidden} />
      </DesktopWrapper>
    </ErrorBoundary>
  );
};
