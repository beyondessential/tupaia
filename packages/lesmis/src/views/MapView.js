/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { useMapOverlaysData } from '../api';
import { useUrlParams } from '../utils';
import { MapOverlaysPanel } from '../components';

const Container = styled.div`
  position: relative;
  z-index: 1; // make sure the map is under the site menus & search
  display: flex;
  height: calc(100vh - 265px);
  min-height: 600px;
`;

const Main = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
`;

export const MapView = () => {
  const { entityCode } = useUrlParams();
  const [selectedOverlay, setSelectedOverlay] = useState(null);

  const { data: overlaysData, isLoading } = useMapOverlaysData({ entityCode });

  return (
    <Container>
      <MapOverlaysPanel
        isLoading={isLoading}
        overlays={overlaysData}
        selectedOverlay={selectedOverlay}
        setSelectedOverlay={setSelectedOverlay}
      />
      <Main>Map</Main>
    </Container>
  );
};
