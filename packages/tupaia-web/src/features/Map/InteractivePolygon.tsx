/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Polygon } from 'react-leaflet';
import styled from 'styled-components';
import {
  ActivePolygon,
  AreaTooltip,
  Color,
  ColorKey,
  Entity,
  GenericDataItem,
  MeasureData,
  OrgUnitCode,
  MAP_COLORS,
  BREWER_PALETTE,
} from '@tupaia/ui-map-components';

const { POLYGON_BLUE, POLYGON_HIGHLIGHT } = MAP_COLORS;

const BasicPolygon = styled(Polygon)`
  fill: ${POLYGON_BLUE};
  fill-opacity: 0.04;
  stroke-width: 1;
  &:hover {
    fill-opacity: 0.5;
    stroke: ${POLYGON_HIGHLIGHT};
    fill: ${POLYGON_HIGHLIGHT};
  }
`;

const ShadedPolygon = styled(Polygon)`
  fill-opacity: 0.5;
  &:hover {
    fill-opacity: 0.8;
  }
`;

const TransparentShadedPolygon = styled(Polygon)`
  fill: ${POLYGON_BLUE};
  fill-opacity: 0;
  &:hover {
    fill-opacity: 0.1;
  }
`;

const shade = '#EE6230';

export const InteractivePolygon = ({ entity, isActive }) => {
  const { code, name, region, bounds, children } = entity;
  const coordinates = region;
  const hasChildren = children?.length > 0;

  if (!coordinates) return null;

  if (isActive) {
    return (
      <ActivePolygon
        shade={shade}
        hasChildren={hasChildren}
        coordinates={coordinates}
        // Randomize key to ensure polygon appears at top. This is still important even
        // though the polygon is in a LayerGroup due to issues with react-leaflet that
        // maintainer says are out of scope for the module.
        key={code}
      />
    );
  }

  if (shade) {
    if (shade === 'transparent') {
      return (
        <TransparentShadedPolygon positions={coordinates} onClick={() => console.log('click')} />
      );
    }

    // To match with the color in markerIcon.js which uses BREWER_PALETTE
    const color = BREWER_PALETTE[shade as ColorKey] || shade;

    // Work around: color should go through the styled components
    // but there is a rendering bug between Styled Components + Leaflet
    return (
      <ShadedPolygon
        positions={coordinates}
        onClick={() => console.log('click')}
        pathOptions={{
          color,
          fillColor: color,
        }}
      />
    );
  }

  return <BasicPolygon positions={coordinates} onClick={() => console.log('click')} />;
};
