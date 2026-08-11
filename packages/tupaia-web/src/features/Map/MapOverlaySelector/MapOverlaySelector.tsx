import { ErrorBoundary } from '@tupaia/ui-components';
import type { LegendProps, TileSet } from '@tupaia/ui-map-components';
import React, { useState } from 'react';
import { DesktopMapOverlaySelector } from './DesktopMapOverlaySelector';
import { MobileMapOverlaySelector } from './MobileMapOverlaySelector';

export const MapOverlaySelector = ({
  hiddenValues,
  activeTileSet,
}: {
  hiddenValues: LegendProps['hiddenValues'];
  activeTileSet: TileSet;
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
