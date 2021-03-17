/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  MapContainer,
  TileLayer,
  MarkerLayer,
  PolygonLayer,
  TilePicker as TilePickerComponent,
  Legend as LegendComponent,
} from '../../src';
import { LoginModal } from '../story-utils/LoginForm';
import { useOrgUnitData, useMeasureData } from '../story-utils/api';
import { TILE_SETS } from '../../src/components/Map/constants';

const queryClient = new QueryClient();

const Container = styled.div`
  position: relative;
  height: 500px;

  > button {
    top: 2rem;
    right: 2rem;
    z-index: 999;
  }
`;

export default {
  title: 'Map/Map',
  decorators: [
    Story => (
      <Container>
        <QueryClientProvider client={queryClient}>
          <LoginModal />
          <Story />
        </QueryClientProvider>
      </Container>
    ),
  ],
};

const organisationUnitCode = 'TO_Tongatapu';
const projectCode = 'fanafana';

const TilePicker = styled(TilePickerComponent)`
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 999;
`;

const Legend = styled(LegendComponent)`
  position: absolute;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
`;

export const CompleteMap = () => {
  const [activeTileSetKey, setActiveTileSetKey] = useState(TILE_SETS[0].key);
  const activeTileSet = TILE_SETS.find(tileSet => tileSet.key === activeTileSetKey);
  const { data: orgUnitData } = useOrgUnitData({
    organisationUnitCode,
    projectCode,
    includeCountryData: true,
  });

  const { data: measureData } = useMeasureData({ projectCode, organisationUnitCode });

  return (
    <>
      <MapContainer location={orgUnitData?.location}>
        <TileLayer tileSetUrl={activeTileSet.url} />
        <MarkerLayer
          measureData={measureData?.measureData}
          measureOptions={measureData?.measureOptions}
        />
        <PolygonLayer data={orgUnitData} />
        <Legend />
      </MapContainer>
      <TilePicker
        tileSets={TILE_SETS}
        activeTileSet={activeTileSet}
        onChange={setActiveTileSetKey}
      />
      <Legend measureOptions={measureData?.measureOptions} />
    </>
  );
};
