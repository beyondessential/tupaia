/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Polygon,
  MapContainer,
  TileLayer,
  InversePolygonMask,
  IconMarker,
} from '@tupaia/ui-components/lib/map';
import { TILE_SETS, RED, COUNTRY_CODE } from '../constants';
import { useEntityData } from '../api';

const TILE_SET_URL = TILE_SETS.find(t => t.key === 'satellite').url;

const Map = styled(MapContainer)`
  z-index: 1;
  width: 510px;
  min-height: 370px;
  height: auto;
`;

const BasicPolygon = styled(Polygon)`
  fill: ${RED};
  fill-opacity: 0.3;
  stroke: ${RED};
`;

/* eslint-disable react/prop-types */
const CountryMask = ({ countryData }) => {
  return <InversePolygonMask region={countryData?.region} />;
};

const RegionPolygon = ({ entityData }) => {
  if (!entityData?.region) return null;
  if (entityData?.type === 'country') return null; // country is fine without, as it has the mask

  return <BasicPolygon positions={entityData?.region} interactive={false} />;
};

const PointMarker = ({ entityData }) =>
  entityData?.point && <IconMarker coordinates={entityData?.point} color={RED} scale={1.5} />;
/* eslint-enable react/prop-types */

export const MiniMap = ({ entityCode }) => {
  const { data: countryData, isLoading: isLoadingCountryData } = useEntityData(COUNTRY_CODE);
  const { data: entityData, isLoading: isLoadingEntityData } = useEntityData(entityCode);

  return isLoadingCountryData || isLoadingEntityData ? null : (
    <Map bounds={entityData?.bounds} dragging={false} zoomControl={false}>
      <TileLayer tileSetUrl={TILE_SET_URL} />
      <CountryMask countryData={countryData} />
      <RegionPolygon entityData={entityData} />
      <PointMarker entityData={entityData} />
    </Map>
  );
};
MiniMap.propTypes = {
  entityCode: PropTypes.string.isRequired,
};
