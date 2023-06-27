/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useMapOverlayData, useMapOverlays } from '../../api/queries';
import { URL_SEARCH_PARAMS } from '../../constants';
import { flattenMapOverlays } from '../../utils';

const useGetMapOverlays = () => {
  const { projectCode, entityCode } = useParams();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const { data: mapOverlaysResponse, isLoading } = useMapOverlays(projectCode, entityCode);
  const mapOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.OVERLAY);
  const mapOverlayPeriod =
    urlSearchParams.get(URL_SEARCH_PARAMS.OVERLAY_PERIOD) || 'DEFAULT_PERIOD';
  const flattenedOverlays = flattenMapOverlays(mapOverlaysResponse?.mapOverlays);

  useEffect(() => {
    const updateMapOverlaySearchParams = () => {
      if (isLoading || !flattenedOverlays || !mapOverlayCode) return;

      const selectedOverlay = flattenedOverlays.find(
        mapOverlay => mapOverlay.code === mapOverlayCode,
      );
      if (selectedOverlay) return;
      // whenever the project or entity changes, and the available map overlays changes, update the map overlay search params to either the first available overlay, or the previously selected overlay if it still applies
      urlSearchParams.set(URL_SEARCH_PARAMS.OVERLAY, flattenedOverlays[0]?.code || '');
      urlSearchParams.set(URL_SEARCH_PARAMS.OVERLAY_PERIOD, mapOverlayPeriod);
      setUrlSearchParams(urlSearchParams.toString(), {
        replace: true,
      });
    };
    updateMapOverlaySearchParams();
  }, [projectCode, entityCode, flattenedOverlays, mapOverlayCode, isLoading]);

  const { data: mapOverlayData, isLoading: isLoadingData } = useMapOverlayData(
    projectCode,
    entityCode,
    mapOverlayCode,
  );

  return {
    mapOverlayData,
    isLoading: isLoading || isLoadingData,
    selectedOverlay: flattenedOverlays.find(mapOverlay => mapOverlay.code === mapOverlayCode),
  };
};

export const MapOverlays = () => {
  const { mapOverlayData, selectedOverlay } = useGetMapOverlays();
  console.log(selectedOverlay);
  return <></>;
};
