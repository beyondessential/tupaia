/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Marker } from 'react-leaflet';
import { getMarkerForValue, ICON_VALUES } from './markerIcons';

export const IconMarker = React.memo(
  ({ icon, color, children, coordinates, scale, handleClick }) => (
    <Marker
      position={coordinates}
      icon={getMarkerForValue(icon, color, scale)}
      eventHandlers={{
        click: handleClick,
      }}
    >
      {children}
    </Marker>
  ),
);

IconMarker.propTypes = {
  coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
  children: PropTypes.node,
  icon: PropTypes.oneOf(ICON_VALUES),
  color: PropTypes.string.isRequired,
  scale: PropTypes.number,
  handleClick: PropTypes.func,
};

IconMarker.defaultProps = {
  scale: 1,
  children: null,
  handleClick: () => {},
  icon: 'pin',
};
