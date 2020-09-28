/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MapControlComponent } from '../src/containers/MapControl';
import tile1 from './tile1.png';
import tile2 from './tile2.png';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  background: #050912;
  height: 90vh;
`;

const MainMap = styled.div`
  flex: 1;
  padding-top: 15%;
  padding-left: 45%;
  text-transform: uppercase;
`;

const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const RightCol = styled.div`
  position: relative;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  -webkit-box-pack: center;
  justify-content: center;
  padding: 10px 10px 0;
`;

const MainLegend = styled.div`
  width: 100%;
  background: #16161c;
  color: #eeeeee;
  padding: 1rem;
  text-align: center;
  text-transform: uppercase;
  margin-right: 160px;
  margin-left: 20px;
  margin-bottom: 1rem;
`;

export default {
  title: 'MapControl',
  component: MapControlComponent,
  decorators: [
    Story => (
      <Container>
        <LeftCol>
          <MainMap>Main Map</MainMap>
          <Row>
            <MainLegend>Legend</MainLegend>
          </Row>
        </LeftCol>
        <RightCol>
          <Story />
        </RightCol>
      </Container>
    ),
  ],
};

const TILES = [
  {
    label: 'Roads',
    thumbnail: tile1,
  },
  {
    label: 'Waterways',
    thumbnail: tile2,
  },
];

const Template = args => <MapControlComponent {...args} />;

export const MapControl = Template.bind({});
MapControl.args = {
  tiles: TILES,
};
