/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  MapContainer,
  TileLayer,
  InversePolygonMask,
  IconMarker,
} from '@tupaia/ui-components/lib/map';
import { TILE_SETS, RED } from '../constants';
import { useEntityData } from '../api';

const TILE_SET_URL = TILE_SETS.find(t => t.key === 'satellite').url;

const Map = styled(MapContainer)`
  z-index: 1;
  width: 510px;
  min-height: 370px;
  height: auto;
`;

export const MiniMap = ({ entityCode }) => {
  const { data: entityData, isLoading: isLoadingEntityData } = useEntityData(entityCode);

  return isLoadingEntityData ? null : (
    <Map bounds={entityData?.bounds} dragging={false} zoomControl={false}>
      <TileLayer tileSetUrl={TILE_SET_URL} />
      {entityData?.region && <InversePolygonMask region={entityData?.region} />}
      {entityData?.point && <IconMarker coordinates={entityData?.point} color={RED} />}
    </Map>
  );
};
MiniMap.propTypes = {
  entityCode: PropTypes.string.isRequired,
};
