/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { DesktopMapOverlaySelector } from './DesktopMapOverlaySelector';
import { MobileMapOverlaySelector } from './MobileMapOverlaySelector';
import { useEntity, useMapOverlays } from '../../../api/queries';
import { URL_SEARCH_PARAMS } from '../../../constants';
import { flattenMapOverlays } from '../../../utils';
import { MapOverlayList } from './MapOverlayList';

export const MapOverlaySelector = () => {
  const [overlayLibraryOpen, setOverlayLibraryOpen] = useState(false);
  const [urlSearchParams] = useSearchParams();
  const { projectCode, entityCode } = useParams();
  const mapOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const { data: mapOverlayResponse, isLoading } = useMapOverlays(projectCode, entityCode);
  const { data: entity } = useEntity(entityCode);

  const mapOverlayGroups = mapOverlayResponse?.mapOverlays || [];
  const flattenedMapOverlays = flattenMapOverlays(mapOverlayGroups);

  const selectedMapOverlay = flattenedMapOverlays.find(
    mapOverlay => mapOverlay.code === mapOverlayCode,
  );

  const toggleOverlayLibrary = () => {
    setOverlayLibraryOpen(!overlayLibraryOpen);
  };

  const list = mapOverlayResponse?.mapOverlays.length ? (
    <MapOverlayList mapOverlayGroups={mapOverlayGroups} />
  ) : null;

  return (
    <>
      <MobileMapOverlaySelector />
      <DesktopMapOverlaySelector
        hasMapOverlays={mapOverlayGroups.length > 0}
        isLoading={isLoading}
        entityName={entity?.name}
        mapOverlayName={selectedMapOverlay?.name}
        overlayLibraryOpen={overlayLibraryOpen}
        toggleOverlayLibrary={toggleOverlayLibrary}
      >
        {list}
      </DesktopMapOverlaySelector>
    </>
  );
};
