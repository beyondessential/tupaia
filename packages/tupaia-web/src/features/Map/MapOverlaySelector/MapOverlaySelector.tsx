/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { ErrorBoundary } from '@tupaia/ui-components';
import { LegendProps } from '@tupaia/ui-map-components';
import { DesktopMapOverlaySelector } from './DesktopMapOverlaySelector';
import { MobileMapOverlaySelector } from './MobileMapOverlaySelector';

export const MapOverlaySelector = ({
  hiddenValues,
  activeTileSet,
}: {
  hiddenValues: LegendProps['hiddenValues'];
  activeTileSet: {
    key: string;
    label: string;
    thumbnail: string;
    url: string;
  };
}) => {
  const [overlayLibraryOpen, setOverlayLibraryOpen] = useState(false);

  const toggleOverlayLibrary = () => {
    setOverlayLibraryOpen(!overlayLibraryOpen);
  };

  return (
    <ErrorBoundary>
      <MobileMapOverlaySelector
        overlayLibraryOpen={overlayLibraryOpen}
        toggleOverlayLibrary={toggleOverlayLibrary}
      />
      <DesktopMapOverlaySelector
        overlayLibraryOpen={overlayLibraryOpen}
        toggleOverlayLibrary={toggleOverlayLibrary}
        hiddenValues={hiddenValues}
        activeTileSet={activeTileSet}
      />
    </ErrorBoundary>
  );
};
