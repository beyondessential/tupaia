/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Legend, LegendProps } from '@tupaia/ui-map-components';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../../constants';
import { useMapOverlayReport } from '../utils';

const Wrapper = styled.div`
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  width: 100%;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

export const DesktopMapLegend = ({ hiddenValues, setValueHidden }: LegendProps) => {
  const [urlSearchParams] = useSearchParams();
  const selectedOverlay = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const { data: overlayReportData } = useMapOverlayReport();

  if (!selectedOverlay) {
    return null;
  }

  return (
    <Wrapper>
      <Legend
        measureInfo={{ [selectedOverlay]: overlayReportData }}
        setValueHidden={setValueHidden}
        hiddenValues={hiddenValues}
        currentMapOverlayCodes={[selectedOverlay]}
        displayedMapOverlayCodes={[selectedOverlay]}
      />
    </Wrapper>
  );
};
