/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { DesktopMapOverlaySelector } from './DesktopMapOverlaySelector';
import { MobileMapOverlaySelector } from './MobileMapOverlaySelector';

export const MapOverlaySelector = () => {
  const [overlayLibraryOpen, setOverlayLibraryOpen] = useState(false);

  const toggleOverlayLibrary = () => {
    setOverlayLibraryOpen(!overlayLibraryOpen);
  };

  return (
    <>
      <MobileMapOverlaySelector />
      <DesktopMapOverlaySelector
        overlayLibraryOpen={overlayLibraryOpen}
        toggleOverlayLibrary={toggleOverlayLibrary}
      />
    </>
  );
};
