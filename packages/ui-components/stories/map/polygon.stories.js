/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import L from 'leaflet';
import { LeafletMapContainer, TileLayer, PolygonLayer } from '../../src/components/Map';
import entityData from './data/entityData.json';

const Container = styled.div`
  position: relative;
  height: 800px;
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

const { bounds } = entityData[0];
const mapBoxBounds = L.latLngBounds(bounds);
const maxBounds = mapBoxBounds.pad(1);

export const SimplePolygonLayer = () => (
  <LeafletMapContainer style={{ height: 500 }} bounds={maxBounds}>
    <TileLayer />
    <PolygonLayer entities={entityData} />
  </LeafletMapContainer>
);
