/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Map } from '../Map';
import { MapOverlayBar } from '../MapOverlayBar/MapOverlayBar';
import { MobileControl, MOBILE_CONTROL_HEIGHT } from '../MapOverlayBar/MobileControl';

const MapContainer = styled.div`
  height: calc(100vh - ${p => p.$topOffset}px - ${MOBILE_CONTROL_HEIGHT}px);
`;

export const MapSection = ({ topOffset }) => {
  return (
    <>
      <MapContainer $topOffset={topOffset}>
        <Map showZoomControl={false} />
        <MapOverlayBar Control={MobileControl} />
      </MapContainer>
    </>
  );
};

MapSection.propTypes = {
  topOffset: PropTypes.number.isRequired,
};
