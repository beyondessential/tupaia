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

const mapOverlayIdA = 'mapOverlayIdA';
const mapOverlayIdB = 'mapOverlayIdB';

export default {
  title: 'Map/Legend',
  component: Legend,
  argTypes: {
    displayedMapOverlayIds: {
      control: 'check',
      options: [mapOverlayIdA, mapOverlayIdB],
      description: 'Map overlays that have been switched on',
    },
    currentMapOverlayIds: {
      description: 'Map overlays that has been selected in hierarchy',
      control: null,
    },
    measureInfo: {
      control: null,
    },
  },
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const LegendStory = ({ ...args }) => <Legend {...args} />;

export const MultipleLegends = LegendStory.bind({});

MultipleLegends.args = {
  measureInfo: {
    [mapOverlayIdA]: { serieses: spectrumMapOverlaySeries },
    [mapOverlayIdB]: { serieses: mapOverlaySerieses },
  },
  currentMapOverlayIds: [mapOverlayIdA, mapOverlayIdB],
  displayedMapOverlayIds: [mapOverlayIdA],
};

export const SimpleLegend = LegendStory.bind({});

SimpleLegend.args = {
  measureInfo: {
    [mapOverlayIdA]: { serieses: spectrumMapOverlaySeries },
  },
  currentMapOverlayIds: [mapOverlayIdA],
  displayedMapOverlayIds: [mapOverlayIdA],
};

export const SpectrumLegend = LegendStory.bind({});

SpectrumLegend.args = {
  measureInfo: {
    [mapOverlayIdA]: { serieses: mapOverlaySerieses },
  },
  currentMapOverlayIds: [mapOverlayIdA],
  displayedMapOverlayIds: [mapOverlayIdA],
};
