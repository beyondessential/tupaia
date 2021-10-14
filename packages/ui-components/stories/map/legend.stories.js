/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import styled from 'styled-components';
import { Legend } from '../../src/components/Map';
import mapOverlaySerieses from './data/mapOverlaySerieses.json';
import spectrumMapOverlaySeries from './data/spectrumMapOverlaySerieses.json';

const Container = styled.div`
  padding: 1rem;
`;

export default {
  title: 'Map/Legend',
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const mapOverlayIdA = 'mapOverlayIdA';
const mapOverlayIdB = 'mapOverlayIdB';

export const SimpleLegend = () => (
  <Legend
    measureInfo={{ [mapOverlayIdA]: { serieses: spectrumMapOverlaySeries } }}
    currentMapOverlayIds={[mapOverlayIdA]}
    displayedMapOverlayIds={[mapOverlayIdA]}
  />
);

export const SpectrumLegend = () => (
  <Legend
    measureInfo={{ [mapOverlayIdA]: { serieses: mapOverlaySerieses } }}
    currentMapOverlayIds={[mapOverlayIdA]}
    displayedMapOverlayIds={[mapOverlayIdA]}
  />
);

export const MultipleLegends = () => (
  <Legend
    measureInfo={{
      [mapOverlayIdA]: { serieses: spectrumMapOverlaySeries },
      [mapOverlayIdB]: { serieses: mapOverlaySerieses },
    }}
    currentMapOverlayIds={[mapOverlayIdA, mapOverlayIdB]}
    displayedMapOverlayIds={[mapOverlayIdA]}
  />
);
