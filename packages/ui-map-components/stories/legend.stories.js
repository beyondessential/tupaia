/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Legend } from '../src/components/Legend';
import mapOverlaySerieses from './data/mapOverlaySerieses.json';
import spectrumMapOverlaySeries from './data/spectrumMapOverlaySerieses.json';

const Container = styled.div`
  padding: 1rem;
`;

const mapOverlayCodeA = 'mapOverlayCodeA';
const mapOverlayCodeB = 'mapOverlayCodeB';

export default {
  title: 'Legend',
  component: Legend,
  argTypes: {
    displayedMapOverlayCodes: {
      control: 'check',
      options: [mapOverlayCodeA, mapOverlayCodeB],
      description: 'Map overlays that have been switched on',
    },
    currentMapOverlayCodes: {
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
    [mapOverlayCodeA]: { serieses: spectrumMapOverlaySeries },
    [mapOverlayCodeB]: { serieses: mapOverlaySerieses },
  },
  currentMapOverlayCodes: [mapOverlayCodeA, mapOverlayCodeB],
  displayedMapOverlayCodes: [mapOverlayCodeA],
};

export const SimpleLegend = LegendStory.bind({});

SimpleLegend.args = {
  measureInfo: {
    [mapOverlayCodeA]: { serieses: mapOverlaySerieses },
  },
  currentMapOverlayCodes: [mapOverlayCodeA],
  displayedMapOverlayCodes: [mapOverlayCodeA],
};

export const SpectrumLegend = LegendStory.bind({});

SpectrumLegend.args = {
  measureInfo: {
    [mapOverlayCodeA]: { serieses: spectrumMapOverlaySeries },
  },
  currentMapOverlayCodes: [mapOverlayCodeA],
  displayedMapOverlayCodes: [mapOverlayCodeA],
};
