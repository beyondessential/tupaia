/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Legend, LegendProps } from '@tupaia/ui-map-components';
import { MobileMapLegend } from './MobileMapLegend';
import { useSearchParams } from 'react-router-dom';
import { DesktopMapLegend } from './DesktopMapLegend';
import { URL_SEARCH_PARAMS } from '../../../constants';
import { useMapOverlayReport } from '../utils';
import styled from 'styled-components';

const SeriesDivider = styled.div`
  height: 0;
  border-bottom: 1px solid #ffffff22;
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

  const LegendComponent = (
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
      <MobileMapLegend Legend={LegendComponent} />
      <DesktopMapLegend Legend={LegendComponent} />
    </>
  );
};
