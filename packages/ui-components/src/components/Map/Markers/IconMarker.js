/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
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
}) => (
  <Marker
    position={coordinates}
    icon={getMarkerForValue(icon, color, scale)}
    ref={markerRef}
    onClick={handleClick}
  >
    {children}
  </Marker>
);

IconMarker.propTypes = {
  coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
  children: PropTypes.node,
  icon: PropTypes.oneOf(ICON_VALUES).isRequired,
  color: PropTypes.string.isRequired,
  scale: PropTypes.number,
  markerRef: PropTypes.func.isRequired,
  handleClick: PropTypes.func,
};

IconMarker.defaultProps = {
  scale: 1,
  children: null,
  handleClick: null,
};
