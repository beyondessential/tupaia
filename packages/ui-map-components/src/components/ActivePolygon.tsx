import React from 'react';
import { Polygon, PolygonProps as LeafletPolygonProps } from 'react-leaflet';
import styled from 'styled-components';
import { MAP_COLORS } from '../constants';

const { POLYGON_HIGHLIGHT } = MAP_COLORS;

interface PolygonProps {
  shade?: string;
  hasChildren?: boolean;
  hasShadedChildren?: boolean;
}

const StyledPolygon = styled(Polygon)<PolygonProps>`
  stroke: ${props => props.shade || POLYGON_HIGHLIGHT};
  opacity: 1;
  fill: ${props => props.shade || 'none'};
  pointer-events: ${props => (props.hasChildren ? 'none !important' : 'auto')};
  stroke-width: ${props => {
    let weight = 2;
    if (props.hasShadedChildren) weight = 0;
    else if (props.shade) weight = 3;
    return weight;
  }};
`;

/**
 * ActivePolygon: The polygon that is selected on the map. This handles the style logic
 */
export interface ActivePolygonProps extends PolygonProps {
  coordinates: LeafletPolygonProps['positions'];
}
export const ActivePolygon = ({
  coordinates,
  shade,
  hasChildren = false,
  hasShadedChildren = false,
}: ActivePolygonProps) => (
  <StyledPolygon
    positions={coordinates}
    shade={shade}
    hasChildren={hasChildren}
    hasShadedChildren={hasShadedChildren}
  />
);
