/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { DesktopMapOverlaySelector } from './DesktopMapOverlaySelector';
import { MobileMapOverlaySelector } from './MobileMapOverlaySelector';

export const MapOverlaySelector = () => {
  return (
    <>
      <MobileMapOverlaySelector />
      <DesktopMapOverlaySelector />
    </>
  );
};
