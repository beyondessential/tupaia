/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { EntityPolygon } from './EntityPolygon';
import { Entity } from '../types';

interface PolygonLayerProps {
  entities?: Entity[];
  Polygon?: React.ComponentType<{ entity: Entity }>;
}

export const PolygonLayer = ({ entities = [], Polygon = EntityPolygon }: PolygonLayerProps) => {
  if (!entities) return null;

  return entities
    .filter(e => Array.isArray(e.region))
    .map(e => <Polygon key={`${e.type}-${e.name}`} entity={e} />);
};
