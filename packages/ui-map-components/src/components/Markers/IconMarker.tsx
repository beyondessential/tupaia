import React from 'react';
import { Marker } from 'react-leaflet';
import { IconKey } from '@tupaia/types';
import { getMarkerForValue } from './markerIcons';
import { MarkerProps } from '../../types';

export const IconMarker = React.memo(
  ({
    icon = IconKey.PIN,
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
