/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { CircleMarker } from 'react-leaflet';
import styled from 'styled-components';

import { getColor } from './markerColors';

const HoverCircle = styled(CircleMarker)`
  &:hover {
    fill-opacity: 0.5;
  }
`;

export class CircleProportionMarker extends PureComponent {
  render() {
    const { radius, radiusScaleFactor, children, coordinates, markerRef, color } = this.props;

    if (coordinates.length !== 2) return null;

    const AREA_MULTIPLIER = 100; // just tuned by hand
    const numberValue = (parseFloat(radius) || 0) * radiusScaleFactor;
    const area = Math.max(numberValue, 1) * AREA_MULTIPLIER;

    const displayRadius = Math.sqrt(area / Math.PI);
    const colorValue = getColor(color);

    return (
      <HoverCircle
        center={coordinates}
        radius={displayRadius}
        innerRef={markerRef}
        color={colorValue}
        fillColor={colorValue}
      >
        {children}
      </HoverCircle>
    );
  }
}

CircleProportionMarker.propTypes = {
  coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
  children: PropTypes.node.isRequired,
  markerRef: PropTypes.func.isRequired,
  radius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  radiusScaleFactor: PropTypes.number,
  color: PropTypes.string.isRequired,
};

CircleProportionMarker.defaultProps = {
  radiusScaleFactor: 1,
};
