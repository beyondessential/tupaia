/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { EntityPolygon } from './EntityPolygon';

export const PolygonLayer = ({ entities, Polygon }) => {
  if (!entities) return null;

  return entities
    .filter(e => Array.isArray(e.region))
    .map(e => <Polygon key={`${e.type}-${e.name}`} entity={e} />);
};

PolygonLayer.propTypes = {
  Polygon: PropTypes.func,
  entities: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
      region: PropTypes.array,
    }),
  ),
};

PolygonLayer.defaultProps = {
  entities: [],
  Polygon: EntityPolygon,
};
