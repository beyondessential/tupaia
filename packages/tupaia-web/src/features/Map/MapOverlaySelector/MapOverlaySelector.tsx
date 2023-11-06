/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { ErrorBoundary } from '@tupaia/ui-components';
import { DesktopMapOverlaySelector } from './DesktopMapOverlaySelector';
import { MobileMapOverlaySelector } from './MobileMapOverlaySelector';
import { MapOverlaySelectorContextProvider } from './MapOverlaySelectorContext';

export const MapOverlaySelector = () => {
  const [overlayLibraryOpen, setOverlayLibraryOpen] = useState(false);

  const toggleOverlayLibrary = () => {
    setOverlayLibraryOpen(!overlayLibraryOpen);
  };

  return (
    <ErrorBoundary>
      <MapOverlaySelectorContextProvider>
        <MobileMapOverlaySelector
          overlayLibraryOpen={overlayLibraryOpen}
          toggleOverlayLibrary={toggleOverlayLibrary}
        />
        <DesktopMapOverlaySelector
          overlayLibraryOpen={overlayLibraryOpen}
          toggleOverlayLibrary={toggleOverlayLibrary}
        />
      </MapOverlaySelectorContextProvider>
    </ErrorBoundary>
  );
};
