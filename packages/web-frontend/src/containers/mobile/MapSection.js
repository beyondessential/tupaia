/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Map } from '../Map';
import { MapOverlayBar } from './MapOverlayBar/MapOverlayBar';
import { MapOverlayLegend } from './MapOverlayLegend';
import { MapAttribution } from '../../components/mobile/MapAttribution';

const MapSectionContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const InnerMapContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 270px;
`;

export const MapSection = ({ useModal }) => {
  return (
    <MapSectionContainer>
      <InnerMapContainer>
        <Map showZoomControl={false} showAttribution={false} />
        <MapAttribution />
        <MapOverlayLegend />
      </InnerMapContainer>
      <MapOverlayBar useModal={useModal} />
    </MapSectionContainer>
  );
};

MapSection.propTypes = {
  useModal: PropTypes.func.isRequired,
};
