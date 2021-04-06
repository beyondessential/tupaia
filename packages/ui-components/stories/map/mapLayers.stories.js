/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, MarkerLayer, PolygonLayer } from '../../src';
import orgUnitData from './data/orgUnitData.json';
import measureData from './data/measureData.json';

const Container = styled.div`
  position: relative;
  height: 500px;
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

export const SimplePolygonLayer = () => (
  <MapContainer location={orgUnitData?.location}>
    <TileLayer />
    <PolygonLayer data={orgUnitData} />
  </MapContainer>
);

export const SimpleMarkerLayer = () => (
  <MapContainer location={orgUnitData?.location}>
    <TileLayer />
    <MarkerLayer
      measureData={measureData?.measureData}
      measureOptions={measureData?.measureOptions}
    />
  </MapContainer>
);
