/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import styled from 'styled-components';
import {
  TileLayer as LeafletTileLayer,
  LayerGroup,
  AttributionControl,
  MapContainer,
} from 'react-leaflet';
import { MeasureMarker } from '../../src';

const Container = styled.div`
  padding: 1rem;
`;

const DEFAULT_BOUNDS = [
  [6.5001, 110],
  [-40, 204.5],
];

export default {
  title: 'Map/Marker',
  decorators: [
    Story => (
      <Container>
        <MapContainer style={{ height: 500 }} bounds={DEFAULT_BOUNDS}>
          <LayerGroup>
            <AttributionControl position="bottomleft" prefix="" />
            <LeafletTileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
          </LayerGroup>
          <Story />
        </MapContainer>
      </Container>
    ),
  ],
};

const measure = {
  171: '3',
  type: 'Facility',
  organisationUnitCode: 'TO_UniversalHC',
  countryCode: 'TO',
  name: 'Universal Clinic & Pharmacy',
  location: {
    type: 'point',
    point: [-21.1399512, 184.7934707],
    bounds: [
      [-22.1399512, 183.7934707],
      [-20.1399512, 185.7934707],
    ],
    region: null,
  },
  photoUrl: null,
  parent: 'TO_Tongatapu',
  facilityTypeName: 'Clinic',
  coordinates: [-21.1399512, 184.7934707],
  region: null,
  color: 'green',
  icon: 'empty',
  originalValue: null,
};

export const SimpleMeasureMarker = () => (
  <MeasureMarker radiusScaleFactor={1} displayPolygons {...measure} />
);
