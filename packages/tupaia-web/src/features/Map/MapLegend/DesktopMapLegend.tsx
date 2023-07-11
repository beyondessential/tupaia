/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Legend, LegendProps } from '@tupaia/ui-map-components';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../../constants';
import { useMapOverlayReport } from '../useMapOverlayReport';
import { useSearchParams } from 'react-router-dom';

// Placeholder for legend
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

export const DesktopMapLegend = ({
  hiddenValues,
  setHiddenValue,
}: {
  hiddenValues: LegendProps['hiddenValues'];
  setHiddenValue: Function;
}) => {
  const [urlSearchParams] = useSearchParams();
  const { data: overlayReportData } = useMapOverlayReport();

  const selectedOverlay = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);

  return (
    <Wrapper>
      <Legend
        measureInfo={{ [selectedOverlay]: overlayReportData }}
        setValueHidden={setHiddenValue as any}
        hiddenValues={hiddenValues}
        currentMapOverlayCodes={[selectedOverlay]}
        displayedMapOverlayCodes={[selectedOverlay]}
      />
    </Wrapper>
  );
};
