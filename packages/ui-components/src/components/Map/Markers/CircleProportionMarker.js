/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { CircleMarker } from 'react-leaflet';
import styled from 'styled-components';
import { getColor } from '../utils';

const HoverCircle = styled(CircleMarker)`
  &:hover {
    fill-opacity: 0.5;
  }
`;

export const CircleProportionMarker = React.memo(({ radius, children, coordinates, color }) => {
  if (coordinates?.length !== 2) return null;

  const AREA_MULTIPLIER = 100; // just tuned by hand
  const numberValue = parseFloat(radius) || 0;
  const area = Math.max(numberValue, 1) * AREA_MULTIPLIER;

  const displayRadius = Math.sqrt(area / Math.PI);
  const colorValue = getColor(color);

  return (
    <HoverCircle
      center={coordinates}
      radius={displayRadius}
      pathOptions={{
        color: colorValue,
        fillColor: colorValue,
      }}
    >
      {children}
    </HoverCircle>
  );
});

CircleProportionMarker.propTypes = {
  coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
  children: PropTypes.node,
  radius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  color: PropTypes.string.isRequired,
};

CircleProportionMarker.defaultProps = {
  children: null,
};
