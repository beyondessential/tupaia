/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Marker } from 'react-leaflet';
import { getMarkerForValue } from './markerIcons';
import { MarkerProps } from '../../types';

export const IconMarker = React.memo(
  ({
    icon = 'pin',
    color,
    children = null,
    coordinates,
    scale = 1,
    handleClick = () => {},
  }: MarkerProps) => (
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
