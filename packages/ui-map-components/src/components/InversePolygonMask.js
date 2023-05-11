/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Polygon as PolygonComponent } from 'react-leaflet';
import styled from 'styled-components';

const BasicPolygon = styled(PolygonComponent)`
  fill: black;
  fill-opacity: 0.8;
  stroke-width: 0;
`;

const getOuterPolygon = region => {
  return [
    [
      [90, -180],
      [90, 180],
      [-90, 180],
      [-90, -180],
    ],
    region,
  ];
};

export const InversePolygonMask = ({ region }) => {
  if (!Array.isArray(region)) {
    return null;
  }

  const positions = getOuterPolygon(region);

  return <BasicPolygon positions={positions} interactive={false} />;
};

InversePolygonMask.propTypes = {
  region: PropTypes.array,
};

InversePolygonMask.defaultProps = {
  region: null,
};
