/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ChangeEvent } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { UseQueryResult } from 'react-query';
import { useFetchMapOverlays } from '../api/queries';
import { URL_SEARCH_PARAMS } from '../constants';
import { MapOverlayGroup, SingleMapOverlayItem } from '../types';

const flattenMapOverlays = (mapOverlayGroups: MapOverlayGroup[] = []): SingleMapOverlayItem[] => {
  return mapOverlayGroups.reduce(
    (mapOverlays: SingleMapOverlayItem[], mapOverlayGroup: MapOverlayGroup) => {
      if (mapOverlayGroup.children)
        return [...mapOverlays, ...flattenMapOverlays(mapOverlayGroup.children)];
      return [...mapOverlays, mapOverlayGroup];
    },
    [],
  );
};

interface UseMapOverlaysResult {
  hasMapOverlays: boolean;
  mapOverlayGroups: MapOverlayGroup[];
  isLoadingMapOverlays: boolean;
  errorLoadingMapOverlays: UseQueryResult['error'];
  selectedOverlayCode: string | null;
  flattenedOverlays: SingleMapOverlayItem[];
  selectedOverlay?: SingleMapOverlayItem;
  updateSelectedMapOverlay: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Gets the map overlays and returns useful utils and values associated with these
 */
export const useMapOverlays = (): UseMapOverlaysResult => {
  const [urlSearchParams, setUrlParams] = useSearchParams();
  const { projectCode, entityCode } = useParams();
  const { data, isLoading, error } = useFetchMapOverlays(projectCode, entityCode);

  const selectedOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const flattenedOverlays = flattenMapOverlays(data?.mapOverlays);

  const selectedOverlay = flattenedOverlays.find(overlay => overlay.code === selectedOverlayCode);

  const updateSelectedMapOverlay = (e: ChangeEvent<HTMLInputElement>) => {
    urlSearchParams.set(URL_SEARCH_PARAMS.MAP_OVERLAY, e.target.value);
    setUrlParams(urlSearchParams);
  };

  return {
    hasMapOverlays: !!data?.mapOverlays?.length,
    mapOverlayGroups: data?.mapOverlays,
    isLoadingMapOverlays: isLoading,
    errorLoadingMapOverlays: error,
    selectedOverlayCode,
    flattenedOverlays,
    selectedOverlay,
    updateSelectedMapOverlay,
  };
};
