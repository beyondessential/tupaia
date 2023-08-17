/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ActivePolygon, MeasureData } from '@tupaia/ui-map-components';
import { Entity } from '../../../types';

export const ActiveEntityPolygon = ({ entity }: { entity: Entity | MeasureData }) => {
  const { region, childCodes } = entity;
  const hasChildren = childCodes && childCodes.length > 0;
  if (!region) return null;

  return (
    <ActivePolygon
      shade={entity?.color}
      hasChildren={hasChildren}
      hasShadedChildren={true}
      coordinates={region}
      // Randomize key to ensure polygon appears at top. This is still important even
      // though the polygon is in a LayerGroup due to issues with react-leaflet that
      // maintainer says are out of scope for the module.
      key={`currentEntityPolygon${Math.random()}`}
    />
  );
};
