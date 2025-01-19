import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  BasePolygon,
  BaseTileLayer,
  IconMarker,
  LeafletMapContainer,
} from '@tupaia/ui-map-components';
import { TILE_SETS, RED, COUNTRY_CODE } from '../constants';
import { useEntityData } from '../api';
import { InversePolygonMask } from './InversePolygonMask';

const TILE_SET_URL = TILE_SETS.find(t => t.key === 'satellite').url;

// style the map to have dimensions, plus remove the Leaflet attribution (it's shown on the main
// map, which is hopefully enough credit)
const Map = styled(LeafletMapContainer)`
  z-index: 1;
  min-height: 370px;
  height: auto;

  .leaflet-control-attribution {
    display: none;
  }
`;

const BasicPolygon = styled(BasePolygon)`
  fill: ${props => props.theme.palette.primary.main};
  fill-opacity: 0.3;
  stroke: ${props => props.theme.palette.primary.main};
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
  const { data: countryData } = useEntityData(COUNTRY_CODE);
  const { data: entityData } = useEntityData(entityCode);

  return (
    <Map bounds={entityData?.bounds} dragging={false} zoomControl={false}>
      <BaseTileLayer url={TILE_SET_URL} />
      {countryData && <CountryMask countryData={countryData} />}
      {entityData && <RegionPolygon entityData={entityData} />}
      {entityData && <PointMarker entityData={entityData} />}
    </Map>
  );
};

MiniMap.propTypes = {
  entityCode: PropTypes.string.isRequired,
};
