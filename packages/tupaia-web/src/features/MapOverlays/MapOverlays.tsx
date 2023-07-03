/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PolygonLayer } from './PolygonLayer';
import { MarkerLayer } from './MarkerLayer';

export const MapOverlays = () => {
  return (
    <>
      <PolygonLayer />
      <MarkerLayer />
    </>
  );
};
