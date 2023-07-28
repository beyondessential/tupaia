/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import {
  TileLayer as LeafletTileLayer,
  LayerGroup,
  AttributionControl,
  MapContainer,
} from 'react-leaflet';
import { MeasureMarker } from '../src/components/Markers/MeasureMarker';
import { MeasurePopup } from '../src/components/Markers/MeasurePopup';

const Container = styled.div`
  padding: 1rem;
`;

const DEFAULT_BOUNDS = [
  [-22.1399512, 183.7934707],
  [-20.1399512, 185.7934707],
];

export default {
  title: 'Marker',
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

export const IconMarker = () => (
  <MeasureMarker displayPolygons coordinates={[-21.1399512, 184.7934707]} icon="pin" color="blue" />
);

export const UpArrowIconMarker = () => (
  <MeasureMarker displayPolygons coordinates={[-21.1399512, 184.7934707]} icon="upArrow" />
);

export const CircleMarker = () => (
  <MeasureMarker displayPolygons coordinates={[-21.1399512, 184.7934707]} radius="12" color="red" />
);

export const CombinedMarker = () => (
  <MeasureMarker
    displayPolygons
    coordinates={[-21.1399512, 184.7934707]}
    radius="12"
    icon="pin"
    color="green"
  />
);

const markerData = {
  coordinates: [-21.1399512, 184.7934707],
  organisationUnitCode: 'TO_UniversalHC',
  name: 'Universal Clinic & Pharmacy',
};

const mapOverlaySerieses = [
  {
    customColors: 'RoyalBlue,RoyalBlue,OrangeRed,OrangeRed',
    measureLevel: 'Facility',
    name: 'Operational facilities',
    type: 'icon',
    key: '126',
    valueMapping: {
      'Fully Operational': {
        icon: 'circle',
        name: 'Open',
        value: ['Fully Operational', 'Operational but closed this week'],
        color: '#005AC8',
      },
      'Operational but closed this week': {
        icon: 'circle',
        name: 'Open',
        value: ['Fully Operational', 'Operational but closed this week'],
        color: '#005AC8',
      },
      'Temporarily Closed': {
        icon: 'x',
        name: 'Temporarily closed',
        value: 'Temporarily Closed',
        color: '#FA7850',
      },
      'Permanently Closed': {
        icon: 'triangle',
        name: 'Permanently closed',
        value: 'Permanently Closed',
        color: '#FA78FA',
      },
      null: {
        icon: 'empty',
        name: 'No data',
        value: 'null',
        color: '#00A0FA',
      },
    },
  },
  {
    measureLevel: 'Facility',
    displayedValueKey: 'facilityTypeName',
    name: 'Facility type',
    type: 'color',
    key: '171',
    valueMapping: {
      1: {
        name: 'Hospital',
        value: 1,
        color: 'yellow',
      },
      2: {
        name: 'Community health centre',
        value: 2,
        color: 'teal',
      },
      3: {
        name: 'Clinic',
        value: 3,
        color: 'green',
      },
      4: {
        name: 'Aid post',
        value: 4,
        color: 'orange',
      },
      other: {
        name: 'Other',
        value: 'other',
        color: 'purple',
      },
      null: {
        name: 'No data',
        value: 'null',
        color: 'grey',
      },
    },
  },
];

export const PopupMarker = () => (
  <MeasureMarker
    displayPolygons
    coordinates={[-21.1399512, 184.7934707]}
    icon="circle"
    color="blue"
  >
    <MeasurePopup markerData={markerData} serieses={mapOverlaySerieses} />
  </MeasureMarker>
);
