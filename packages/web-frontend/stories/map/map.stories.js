/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Pane } from 'react-leaflet';
import { LeafletMap } from '../../src/containers/Map/LeafletMap';
import { TileLayer } from '../../src/containers/Map/TileLayer';
import { DemoLand } from '../../src/containers/Map/DemoLand';

export default {
  title: 'Map/Map',
  component: LeafletMap,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template = args => (
  <LeafletMap {...args}>
    <TileLayer />
    <Pane name="demo-land">
      <DemoLand />
    </Pane>
  </LeafletMap>
);

export const BasicLeafletMap = Template.bind({});

BasicLeafletMap.args = {
  shouldSnapToPosition: true,
  position: {
    bounds: [
      [1.5001, 110],
      [-40, 204.5],
    ],
  },
  onClick: () => {},
  onPositionChanged: () => {},
};

// All of these controls only work on component initialise, so no point having them be controllable
BasicLeafletMap.argTypes = {
  shouldSnapToPosition: { control: { disable: true } },
  position: { control: { disable: true } },
  rightPadding: { control: { disable: true } },
  children: { control: { disable: true } }, // children for this map are defined above
};
