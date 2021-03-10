/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer } from '../../src';

const Container = styled.div`
  position: relative;

  > button {
    top: 2rem;
    right: 2rem;
    z-index: 9999;
  }
`;

export default {
  title: 'Map/MapLayers',
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

export const SimpleTileLayer = () => (
  <MapContainer>
    <TileLayer />
  </MapContainer>
);
