/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Map } from '../Map';
import { MapOverlayBar, MAP_OVERLAY_BAR_HEIGHT } from './MapOverlayBar/MapOverlayBar';

const MapContainer = styled.div`
  height: calc(100vh - ${p => p.$topOffset}px - ${MAP_OVERLAY_BAR_HEIGHT}px);
`;

export const MapSection = ({ topOffset }) => {
  return (
    <>
      <MapContainer $topOffset={topOffset}>
        <Map showZoomControl={false} />
        <MapOverlayBar />
      </MapContainer>
    </>
  );
};

MapSection.propTypes = {
  topOffset: PropTypes.number.isRequired,
};
