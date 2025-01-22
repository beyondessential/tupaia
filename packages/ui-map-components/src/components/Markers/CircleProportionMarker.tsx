import React from 'react';
import { CircleMarker } from 'react-leaflet';
import styled from 'styled-components';
import { getColor } from '../../utils';
import { Color, MarkerProps } from '../../types';

const HoverCircle = styled(CircleMarker)`
  &:hover {
    fill-opacity: 0.5;
  }
`;

export const CircleProportionMarker = React.memo(
  ({ radius, children, coordinates, color }: MarkerProps) => {
    if ((coordinates as number[])?.length !== 2) return null;

    const AREA_MULTIPLIER = 100; // just tuned by hand
    const numberValue = parseFloat(String(radius)) || 0;
    const area = Math.max(numberValue, 1) * AREA_MULTIPLIER;

    const displayRadius = Math.sqrt(area / Math.PI);
    const colorValue = getColor(color as Color);
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
  },
);
