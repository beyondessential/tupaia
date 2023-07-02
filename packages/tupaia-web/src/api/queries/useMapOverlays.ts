/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, UseQueryResult } from 'react-query';
import { get } from '../api';
import { EntityCode, MapOverlayGroup, ProjectCode, SingleMapOverlayItem } from '../../types';
import { URL_SEARCH_PARAMS } from '../../constants';

const mapOverlayByCode = (
  mapOverlayGroups: MapOverlayGroup[] = [],
): Record<SingleMapOverlayItem['code'], SingleMapOverlayItem> => {
  return mapOverlayGroups.reduce(
    (
      result: Record<string, SingleMapOverlayItem>,
      mapOverlay: MapOverlayGroup | SingleMapOverlayItem,
    ) => {
      if (mapOverlay.children) {
        return { ...result, ...mapOverlayByCode(mapOverlay.children) };
      }
      return {
        ...result,
        [mapOverlay.code]: mapOverlay,
      };
    },
    {},
  );
};

interface UseMapOverlaysResult {
  hasMapOverlays: boolean;
  mapOverlayGroups: MapOverlayGroup[];
  isLoadingMapOverlays: boolean;
  errorLoadingMapOverlays: UseQueryResult['error'];
  selectedOverlayCode: string | null;
  selectedOverlay?: SingleMapOverlayItem;
}

/**
 * Gets the map overlays and returns useful utils and values associated with these
 */
export const useMapOverlays = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
): UseMapOverlaysResult => {
  const [urlSearchParams] = useSearchParams();
  const { data, isLoading, error } = useQuery(
    ['mapOverlays', projectCode, entityCode],
    async () => {
      return get(`mapOverlays/${projectCode}/${entityCode}`);
    },
    {
      enabled: !!projectCode && !!entityCode,
    },
  );

  const selectedOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const codedOverlays = mapOverlayByCode(data?.mapOverlays);

  const selectedOverlay = codedOverlays[selectedOverlayCode!];

  return {
    hasMapOverlays: !!data?.mapOverlays?.length,
    mapOverlayGroups: data?.mapOverlays,
    isLoadingMapOverlays: isLoading,
    errorLoadingMapOverlays: error,
    selectedOverlayCode,
    selectedOverlay,
  };
};
