/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { Marker } from 'react-leaflet';

import { getMarkerForValue, ICON_VALUES } from './markerIcons';

export const IconMarker = ({
  icon,
  color,
  children,
  coordinates,
  markerRef,
  scale,
  handleClick,
}) => {
  const iconHtml = getMarkerForValue(icon, color, scale);

  return (
    <Marker position={coordinates} icon={iconHtml} ref={markerRef} onClick={handleClick}>
      {children}
    </Marker>
  );
};

IconMarker.propTypes = {
  coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
  children: PropTypes.node,
  icon: PropTypes.oneOf(ICON_VALUES).isRequired,
  color: PropTypes.string.isRequired,
  scale: PropTypes.number,
  markerRef: PropTypes.func.isRequired,
};

IconMarker.defaultProps = {
  scale: 1,
};
