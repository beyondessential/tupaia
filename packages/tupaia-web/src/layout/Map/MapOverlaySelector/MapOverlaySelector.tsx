/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { MapOverlayControl } from './MapOverlayControl';

export const MapOverlaySelector = () => {
  const [pinnedOverlay, setPinnedOverlay] = useState<string | undefined>();
  const hierarchyData = [];
  return (
    <MapOverlayControl
      emptyMessage={'No overlays available for this country'}
      selectedMapOverlays={[]}
      maxSelectedOverlays={2}
      changeMaxSelectedOverlays={() => {}}
      pinnedOverlay={pinnedOverlay}
      setPinnedOverlay={newPinnedOverlay => setPinnedOverlay(newPinnedOverlay)}
      hasOverlays={hierarchyData.length > 0}
    />
  );
};
