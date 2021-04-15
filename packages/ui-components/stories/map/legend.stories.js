/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import styled from 'styled-components';
import { Legend } from '../../src/components/Map';
import measureOptions from './data/measureOptions.json';
import spectrumMeasureOptions from './data/spectrumMeasureOptions.json';

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

export const SimpleLegend = () => <Legend measureOptions={measureOptions} />;

export const SpectrumLegend = () => <Legend measureOptions={spectrumMeasureOptions} />;
