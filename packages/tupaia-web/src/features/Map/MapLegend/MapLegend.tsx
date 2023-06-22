/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { MobileMapLegend } from './MobileMapLegend';
import { DesktopMapLegend } from './DesktopMapLegend';

export const MapLegend = () => {
  return (
    <>
      <MobileMapLegend />
      <DesktopMapLegend />
    </>
  );
};
