/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, MarkerLayer } from '@tupaia/ui-components/lib/map';

const Container = styled.div`
  position: relative;
  z-index: 1; // make sure the map is under the site menus & search
  display: flex;
  height: 100vh;
  min-height: 350px; // below which the map is basically unusable
`;

const Main = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
`;

const Map = styled(MapContainer)`
  flex: 1;
  height: 100%;
  z-index: 1;
`;

export const NewMap = ({ tileSetUrl, position, measureData, measureInfo, onPositionChanged }) => {
  console.log('measureInfo', measureInfo);
  const { serieses, measureOptions } = measureInfo;

  console.log('position', position);
  const handleLocationChange = (center, bounds, zoom) => {
    console.log('change...', center, bounds, zoom);
  };

  return (
    <Container>
      <Main>
        <Map
          bounds={position ? position.bounds : null}
          onLocationChange={handleLocationChange}
          dragging
        >
          <TileLayer tileSetUrl={tileSetUrl} />
          <MarkerLayer measureData={measureData || null} serieses={measureOptions || null} />
        </Map>
      </Main>
    </Container>
  );
};
