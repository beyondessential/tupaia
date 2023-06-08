/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MapWatermark } from './MapWatermark';

const MapContainer = styled.div`
  height: 100vh;
  transition: width 0.5s ease;
  width: 100%;
`;

export const Map = () => {
  return <MapContainer>{/* <Map /> */}</MapContainer>;
};

const Wrapper = styled.div`
  background: lightgrey;
  flex: 1;
  display: flex;
  position: relative;
`;

const MapControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: absolute; // make this absolutely positioned so that it lays over the map
  width: 100%;
  height: 100%;
`;

const MapLegendWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
`;

const Watermark = styled(MapWatermark)`
  margin-left: 2px;
  margin-bottom: 16px;
`;

// Placeholder for MapOverlaySelector component
const MapOverlaySelector = styled.div`
  width: 25%;
  margin: 2em;
  height: 200px;
  background-color: rgba(255, 255, 255, 0.2);
`;

/**
 * This is the layout for the lefthand side of the app, which contains the map controls and watermark, as well as the map
 */

export const MapLayout = () => {
  return (
    <Wrapper>
      <MapControlsContainer>
        <MapOverlaySelector />
        <MapLegendWrapper>{/** This is where the map legend would go */}</MapLegendWrapper>
      </MapControlsContainer>
      <Map />
      {/** This is where the tilepicker would go */}
      <Watermark />
    </Wrapper>
  );
};
