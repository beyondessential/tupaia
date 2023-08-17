/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  TupaiaWebMapOverlaysRequest,
} from '@tupaia/types';
import { get } from '../api';
import {
  EntityCode,
  ProjectCode,
} from '../../types';
import { URL_SEARCH_PARAMS } from '../../constants';

// Retype so we can use shortened names
type SingleMapOverlayItem = TupaiaWebMapOverlaysRequest.TranslatedMapOverlay;
type MapOverlayGroup = TupaiaWebMapOverlaysRequest.TranslatedMapOverlayGroup;
type MapOverlayChild = TupaiaWebMapOverlaysRequest.OverlayChild;
type MapOverlaysResponse = TupaiaWebMapOverlaysRequest.ResBody;

const mapOverlayByCode = (
  mapOverlayGroups: MapOverlayChild[] = [],
): Record<SingleMapOverlayItem['code'], SingleMapOverlayItem> => {
  return mapOverlayGroups.reduce(
    (
      result: Record<string, SingleMapOverlayItem>,
      mapOverlay: MapOverlayGroup | SingleMapOverlayItem,
    ) => {
      if ('children' in mapOverlay) {
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

/**
 * Gets the map overlays and returns useful utils and values associated with these
 */
export const useMapOverlays = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
  const [urlSearchParams] = useSearchParams();
  const { data, isLoading, error } = useQuery(
    ['mapOverlays', projectCode, entityCode],
    (): Promise<MapOverlaysResponse> => get(`mapOverlays/${projectCode}/${entityCode}`),
    {
      enabled: !!projectCode && !!entityCode,
    },
  );

  const selectedOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const codedOverlays = mapOverlayByCode(data?.mapOverlays);

  const selectedOverlay = codedOverlays[selectedOverlayCode!];

  return {
    mapOverlaysByCode: codedOverlays,
    hasMapOverlays: !!data?.mapOverlays?.length,
    mapOverlayGroups: data?.mapOverlays,
    isLoadingMapOverlays: isLoading,
    errorLoadingMapOverlays: error,
    selectedOverlayCode,
    selectedOverlay,
  };
};
