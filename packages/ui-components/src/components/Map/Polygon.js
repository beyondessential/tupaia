/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Polygon as PolygonComponent } from 'react-leaflet';
import styled from 'styled-components';
import { blue } from '@material-ui/core/colors';
import { AreaTooltip } from './AreaTooltip';

export const POLYGON_COLOR = '#EE6230';

const BasicPolygon = styled(PolygonComponent)`
  fill: ${blue['500']};
  fill-opacity: 0.04;
  stroke-width: 1;
  :hover {
    fill-opacity: 0.5;
    stroke: ${POLYGON_COLOR};
    fill: ${POLYGON_COLOR};
  }
`;

export const Polygon = ({ entity }) => {
  if (!entity || !Array.isArray(entity.region)) {
    return null;
  }

  const { name, region } = entity;

  return (
    <BasicPolygon positions={region} interactive={false}>
      <AreaTooltip text={name} />
    </BasicPolygon>
  );
};

Polygon.propTypes = {
  entity: PropTypes.shape({
    name: PropTypes.string,
    region: PropTypes.array,
  }),
};

Polygon.defaultProps = {
  entity: null,
};
