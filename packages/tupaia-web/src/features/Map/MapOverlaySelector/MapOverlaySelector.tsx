/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useParams } from 'react-router';
import { DesktopMapOverlaySelector } from './DesktopMapOverlaySelector';
import { MobileMapOverlaySelector } from './MobileMapOverlaySelector';
import {
  DEFAULT_MAP_OVERLAY_ID,
  DEFAULT_PERIOD_PARAM_STRING,
  URL_SEARCH_PARAMS,
} from '../../../constants';
import { useMapOverlays, useProject } from '../../../api/queries';

const useDefaultMapOverlay = () => {
  const [urlSearchParams, setUrlParams] = useSearchParams();
  const { projectCode, entityCode, dashboardName } = useParams();
  const { data: project, isLoading: isLoadingProject } = useProject(projectCode);
  const { mapOverlaysByCode, isLoadingMapOverlays } = useMapOverlays(projectCode, entityCode);

  const selectedMapOverlay = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const selectedMapOverlayPeriod = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD);
  const isValidMapOverlayId = !!mapOverlaysByCode[selectedMapOverlay];

  useEffect(() => {
    if (isLoadingProject || isLoadingMapOverlays) {
      return;
    }

    if (!selectedMapOverlay || !isValidMapOverlayId) {
      const defaultMapOverlayId = project?.defaultMeasure || DEFAULT_MAP_OVERLAY_ID;
      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY, defaultMapOverlayId);
    }

    if (!selectedMapOverlayPeriod) {
      urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY_PERIOD, DEFAULT_PERIOD_PARAM_STRING);
    }

    setUrlParams(urlSearchParams);
  }, [projectCode, entityCode, dashboardName, project?.code, isValidMapOverlayId]);

  return { selectedMapOverlay };
};

export const MapOverlaySelector = () => {
  const [overlayLibraryOpen, setOverlayLibraryOpen] = useState(false);
  useDefaultMapOverlay();

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
