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
import { MeasureMarker, PopupMarker, MeasurePopup } from '../../src';

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

const data = [
  {
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
  },
  {
    171: '3',
    type: 'Facility',
    organisationUnitCode: 'TO_FPC',
    countryCode: 'TO',
    name: 'Family Planning Clinic',
    location: {
      type: 'point',
      point: [-21.1399, 184.794],
      bounds: [
        [-22.1399, 183.794],
        [-20.1399, 185.794],
      ],
      region: null,
    },
    photoUrl: null,
    parent: 'TO_Tongatapu',
    facilityTypeName: 'Clinic',
    coordinates: [-21.1399, 184.794],
    region: null,
    color: 'green',
    icon: 'empty',
    originalValue: null,
  },
  {
    126: 'Fully Operational',
    171: '1',
    type: 'Facility',
    organisationUnitCode: 'TO_CPMS',
    countryCode: 'TO',
    name: 'CPMS',
    location: {
      type: 'point',
      point: [-21.140273, 184.794035],
      bounds: [
        [-22.140273, 183.794035],
        [-20.140273, 185.794035],
      ],
      region: null,
    },
    photoUrl: null,
    parent: 'TO_Tongatapu',
    submissionDate: '2018-05-10',
    facilityTypeName: 'Medical warehouse',
    coordinates: [-21.140273, 184.794035],
    region: null,
    color: 'yellow',
    icon: 'circle',
    originalValue: null,
  },
  {
    126: 'Fully Operational',
    171: '1',
    type: 'Facility',
    organisationUnitCode: 'TO_VHP',
    countryCode: 'TO',
    name: 'Vaiola Hospital',
    location: {
      type: 'point',
      point: [-21.15515, 184.781183],
      bounds: [
        [-22.15515, 183.781183],
        [-20.15515, 185.781183],
      ],
      region: null,
    },
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498547512254_723266.png',
    parent: 'TO_Tongatapu',
    submissionDate: '2017-06-20',
    facilityTypeName: 'Hospital',
    coordinates: [-21.15515, 184.781183],
    region: null,
    color: 'yellow',
    icon: 'circle',
    originalValue: null,
  },
  {
    photoUrl:
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/images/1498684307634_480266.png',
    parent: 'TO_Tongatapu',
    submissionDate: '2020-04-07',
    facilityTypeName: 'Clinic',
    coordinates: [-21.15151207, 184.783553],
    region: null,
    color: 'green',
    icon: 'circle',
    originalValue: null,
  },
];

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
