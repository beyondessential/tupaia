/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import {
  TileLayer as LeafletTileLayer,
  LayerGroup,
  AttributionControl,
  MapContainer,
} from 'react-leaflet';
import { InteractivePolygon } from '../../src/components/Map';
import multiOverlaySerieses from './data/interactivePolygonSerieses.json';
import area from './data/entityAreaData.json';

const position = {
  bounds: [
    [6.5001, 110],
    [-40, 204.5],
  ],
  center: {
    lat: -9.051335435938194,
    lng: 162.85776114999996,
  },
  zoom: 7,
};

export default {
  title: 'Map/InteractivePolygon',
  decorators: [
    Story => (
      <MapContainer
        style={{ height: 600 }}
        bounds={position.bounds}
        zoom={position.zoom}
        center={position.center}
      >
        <LayerGroup>
          <AttributionControl position="bottomleft" prefix="" />
          <LeafletTileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        </LayerGroup>
        <Story />
      </MapContainer>
    ),
  ],
};

const measureOrgUnits = [
  {
    organisationUnitCode: 'SB_Guadalcanal Province',
    'Anopheles found': 2,
    'An. farauti': '1',
    'An. koliensis': '2',
    isHidden: false,
    color: 'blue',
  },
];

const multiOverlayMeasureData = [
  {
    organisationUnitCode: 'SB_Guadalcanal Province',
    'Anopheles found': 2,
    'An. farauti': '1',
    'An. koliensis': '2',
    'Ae. aegypti': '3',
    'Ae. albopictus': '4',
    'Ae. cooki': '5',
  },
];

export const BasicInteractivePolygon = () => (
  <InteractivePolygon
    multiOverlaySerieses={multiOverlaySerieses}
    multiOverlayMeasureData={multiOverlayMeasureData}
    measureOrgUnits={measureOrgUnits}
    area={area}
    hasMeasureData
    permanentLabels
  />
);
