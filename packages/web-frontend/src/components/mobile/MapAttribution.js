/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import CopyrightIcon from '@material-ui/icons/Copyright';

import { MapWatermark } from '../MapWatermark';
import { LEAFLET_Z_INDEX, MOBILE_BACKGROUND_COLOR } from '../../styles';

const Container = styled.div`
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: ${LEAFLET_Z_INDEX + 2};
  display: flex;
  align-items: center;
`;

const Watermark = styled(MapWatermark)`
  position: relative;
  z-index: ${LEAFLET_Z_INDEX + 2};
  opacity: 0.8;
`;

const InfoButton = styled(IconButton)`
  font-size: 18px;
  padding: 0 10px;
  opacity: 0.7;
`;

const AttributionsContainer = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: calc(100vw - 20px);
  border-radius: 5px;
  background: white;
  padding-top: 4px;
  z-index: ${LEAFLET_Z_INDEX + 3};
  opacity: 0.92;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 0;
  font-size: 21px;
  color: ${MOBILE_BACKGROUND_COLOR};
`;

const AttributionLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 10px;
  justify-content: center;
`;

const StyledCopyrightIcon = styled(CopyrightIcon)`
  margin-right: 4px;
`;

const Divider = styled.div`
  height: 0px;
  border: 1px solid black;
  opacity: 0.3;
`;

export const MapAttribution = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Container>
      <Watermark />
      <InfoButton onClick={() => setIsExpanded(true)}>
        <InfoIcon fontSize="inherit" />
      </InfoButton>
      {isExpanded && (
        <AttributionsContainer>
          <AttributionLink href="https://leafletjs.com/" target="_blank">
            Leaflet
          </AttributionLink>
          <Divider />
          <AttributionLink href="https://www.mapbox.com/about/maps/" target="_blank">
            <StyledCopyrightIcon fontSize="inherit" />
            Mapbox
          </AttributionLink>
          <Divider />
          <AttributionLink href="http://www.openstreetmap.org/copyright" target="_blank">
            <StyledCopyrightIcon fontSize="inherit" />
            OpenStreetMap
          </AttributionLink>
          <Divider />
          <AttributionLink href="https://www.mapbox.com/map-feedback/" target="_blank">
            Improve this map
          </AttributionLink>
          <CloseButton onClick={() => setIsExpanded(false)}>
            <CloseIcon fontSize="inherit" />
          </CloseButton>
        </AttributionsContainer>
      )}
    </Container>
  );
};
