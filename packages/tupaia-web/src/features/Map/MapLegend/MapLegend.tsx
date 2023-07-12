/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Legend, LegendProps } from '@tupaia/ui-map-components';
import { MobileMapLegend } from './MobileMapLegend';
import { useSearchParams } from 'react-router-dom';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../../constants';
import { useMapOverlayReport } from '../utils';
import styled from 'styled-components';

const DesktopWrapper = styled.div`
  pointer-events: auto;

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
`;

export const MapLegend = ({ hiddenValues, setValueHidden }: LegendProps) => {
  const [urlSearchParams] = useSearchParams();
  const selectedOverlay = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const { data: overlayReportData } = useMapOverlayReport();

  if (!selectedOverlay) {
    return null;
  }

  const LegendComponent = () => (
    <Legend
      measureInfo={{ [selectedOverlay]: overlayReportData }}
      setValueHidden={setValueHidden}
      hiddenValues={hiddenValues}
      currentMapOverlayCodes={[selectedOverlay]}
      displayedMapOverlayCodes={[selectedOverlay]}
      SeriesDivider={SeriesDivider}
    />
  );

  return (
    <>
      <MobileMapLegend>
        <LegendComponent />
      </MobileMapLegend>
      <DesktopWrapper>
        <LegendComponent />
      </DesktopWrapper>
    </>
  );
};
