/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { MapContainer, Polygon, TileLayer } from '@tupaia/ui-components/lib/map';
import { TILE_SETS } from '../constants';
import { useEntityData } from '../api';

const TILE_SET_URL = TILE_SETS[1].url;

const Map = styled(MapContainer)`
  width: 510px;
  height: 370px;
`;

export const MiniMap = ({ entityCode }) => {
  const { data: entityData, isFetching: isLoadingEntityData } = useEntityData(entityCode);

  return isLoadingEntityData ? null : (
    <Map bounds={entityData?.bounds} dragging={false} zoomControl={false}>
      <TileLayer tileSetUrl={TILE_SET_URL} />
      <Polygon entity={entityData} />
    </Map>
  );
};
MiniMap.propTypes = {
  entityCode: PropTypes.string.isRequired,
};
