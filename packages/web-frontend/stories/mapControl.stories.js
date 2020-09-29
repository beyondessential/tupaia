/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MapControlComponent } from '../src/containers/MapControl';
import tile1 from './tile1.png';
import { mapBoxToken } from '../src/utils';

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

const GERRY_ACCESS_KEY =
  'pk.eyJ1IjoiZ2VkY2tlbGx5IiwiYSI6ImNrY3BsZ2RwYTB3N20yc3FyaTZlNzhzNDUifQ.N61FIOcE-3RTksi9Tlm5ow#10.25/17.9782/102.6277';

const GERRY_USERNAME = 'gedckelly';

const makeStyleUrl = ({ styleId, accessKey = GERRY_ACCESS_KEY, username = GERRY_USERNAME }) =>
  `https://api.mapbox.com/styles/v1/${username}/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${accessKey}`;

const dummyState = [
  {
    key: 'osm',
    label: 'Open Street',
    thumbnail: tile1,
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  },
  {
    key: 'satellite',
    label: 'Satellite',
    thumbnail: tile1,
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${mapBoxToken}`,
  },
  {
    key: 'waterways',
    label: 'Waterways',
    thumbnail: tile1,
    url: makeStyleUrl({ styleId: 'ckemdct811px619qklzgvvg53' }),
  },
  {
    key: 'roads',
    label: 'Roads',
    thumbnail: tile1,
    url: makeStyleUrl({ styleId: 'ckenp4uq10dfq1anzert7iot7' }),
    legendItems: [
      {
        color: '#D13333',
        label: 'Ethnic group one',
      },
      {
        color: '#E37F49',
        label: 'Ethnic group two',
      },
      {
        color: '#E12EC5',
        label: 'Ethnic group three',
      },
      {
        color: '#22D489',
        label: 'Ethnic group four',
      },
      {
        color: '#2196F3',
        label: 'Ethnic group five',
      },
    ],
  },
  {
    key: 'terrain',
    label: 'Terrain',
    thumbnail: tile1,
    url: makeStyleUrl({ styleId: 'ckenu2thw0ibl1anzk5aarzu6' }),
  },
  {
    key: 'waterways1',
    label: 'Waterways',
    thumbnail: tile1,
    url: makeStyleUrl({ styleId: 'ckemdct811px619qklzgvvg53' }),
  },
  {
    key: 'roads2',
    label: 'Roads',
    thumbnail: tile1,
    url: makeStyleUrl({ styleId: 'ckenp4uq10dfq1anzert7iot7' }),
  },
  {
    key: 'terrain3',
    label: 'Terrain',
    thumbnail: tile1,
    url: makeStyleUrl({ styleId: 'ckenu2thw0ibl1anzk5aarzu6' }),
  },
];

const active = {
  key: 'osm',
  label: 'Open Street',
  thumbnail: tile1,
  url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
};

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
        <Story />
      </Container>
    ),
  ],
};

const Template = args => <MapControlComponent {...args} />;

export const MapControl = Template.bind({});
MapControl.args = {
  tileSets: dummyState,
  activeTileSet: active,
  onChange: () => {},
  onZoomInClick: () => {},
  onZoomOutClick: () => {},
};
