/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ExpandableMapLegend } from './ExpandableMapLegend';
import { FixedMapLegend } from './FixedMapLegend';

export const MapLegend = () => {
  return (
    <>
      <ExpandableMapLegend />
      <FixedMapLegend />
    </>
  );
};
