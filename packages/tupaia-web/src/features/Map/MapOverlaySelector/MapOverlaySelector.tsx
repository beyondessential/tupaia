/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DesktopMapOverlaySelector } from './DesktopMapOverlaySelector';
import { MobileMapOverlaySelector } from './MobileMapOverlaySelector';
import { useEntity } from '../../../api/queries';

export const MapOverlaySelector = () => {
  const [overlayLibraryOpen, setOverlayLibraryOpen] = useState(false);
  const { entityCode } = useParams();
  const { data: entity } = useEntity(entityCode);

  const toggleOverlayLibrary = () => {
    setOverlayLibraryOpen(!overlayLibraryOpen);
  };

  return (
    <>
      <MobileMapOverlaySelector />
      <DesktopMapOverlaySelector
        entityName={entity?.name}
        overlayLibraryOpen={overlayLibraryOpen}
        toggleOverlayLibrary={toggleOverlayLibrary}
      />
    </>
  );
};
