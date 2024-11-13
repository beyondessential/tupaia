/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { POLYGON_MEASURE_TYPES } from '@tupaia/ui-map-components';
import { TupaiaWebMapOverlaysRequest } from '@tupaia/types';
import { get } from '../api';
import { EntityCode, ProjectCode } from '../../types';
import { URL_SEARCH_PARAMS } from '../../constants';

// Retype so we can use shortened names
type SingleMapOverlayItem = TupaiaWebMapOverlaysRequest.TranslatedMapOverlay;
type MapOverlayGroup = TupaiaWebMapOverlaysRequest.TranslatedMapOverlayGroup;
type MapOverlayChild = TupaiaWebMapOverlaysRequest.OverlayChild;
type MapOverlaysResponse = TupaiaWebMapOverlaysRequest.ResBody;

const getFlattenedMapOverlayGroups = (
  mapOverlayGroups: MapOverlayChild[] = [],
): SingleMapOverlayItem[] => {
  return mapOverlayGroups.reduce(
    (result: SingleMapOverlayItem[], mapOverlay: MapOverlayGroup | SingleMapOverlayItem) => {
      if ('children' in mapOverlay) {
        return [...result, ...getFlattenedMapOverlayGroups(mapOverlay.children)];
      }
      return [...result, mapOverlay];
    },
    [],
  );
};

const mapOverlayByCode = (
  mapOverlays: SingleMapOverlayItem[] = [],
): Record<SingleMapOverlayItem['code'], SingleMapOverlayItem> => {
  return mapOverlays.reduce(
    (result: Record<string, SingleMapOverlayItem>, mapOverlay: SingleMapOverlayItem) => {
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
  const {
    data,
    isInitialLoading: isLoading,
    error,
    isFetched,
  } = useQuery(
    ['mapOverlays', projectCode, entityCode],
    (): Promise<MapOverlaysResponse> => get(`mapOverlays/${projectCode}/${entityCode}`),
    {
      enabled: !!projectCode && !!entityCode,
    },
  );

  const selectedOverlayCode = urlSearchParams.get(URL_SEARCH_PARAMS.MAP_OVERLAY);
  const flattenedMapOverlayGroups = getFlattenedMapOverlayGroups(data?.mapOverlays);
  const codedOverlays = mapOverlayByCode(flattenedMapOverlayGroups);

  const selectedOverlay = codedOverlays[selectedOverlayCode!];
  const isPolygonSerieses = POLYGON_MEASURE_TYPES.includes(selectedOverlay?.displayType);

  return {
    allMapOverlays: flattenedMapOverlayGroups,
    mapOverlaysByCode: codedOverlays,
    hasMapOverlays: !!data?.mapOverlays?.length,
    mapOverlayGroups: data?.mapOverlays,
    isLoadingMapOverlays: isLoading || !isFetched,
    errorLoadingMapOverlays: error,
    selectedOverlayCode,
    selectedOverlay,
    isPolygonSerieses,
  };
};
