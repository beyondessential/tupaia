/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { FixedMapOverlaySelector } from './FixedMapOverlaySelector';
import { ExpandableMapOverlaySelector } from './ExpandableMapOverlaySelector';

export const MapOverlaySelector = () => {
  return (
    <>
      <ExpandableMapOverlaySelector />
      <FixedMapOverlaySelector />
    </>
  );
};
