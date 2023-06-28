/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import {
  MapOverlayGroup,
  EntityCode,
  ProjectCode,
  DashboardCode,
  SingleMapOverlayItem,
} from '../../types';

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

export const useMapOverlays = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  mapOverlayCode?: DashboardCode | null,
) => {
  const { data, ...query } = useQuery(
    ['mapOverlays', projectCode, entityCode],
    async () => {
      return get(`mapOverlays/${projectCode}/${entityCode}`);
    },
    {
      enabled: !!projectCode && !!entityCode,
    },
  );

  const flattenedOverlays = flattenMapOverlays(data?.mapOverlays);

  const selectedOverlay = mapOverlayCode
    ? flattenedOverlays.find(overlay => overlay.code === mapOverlayCode)
    : {};

  return {
    hasMapOverlays: !!data?.mapOverlays?.length,
    mapOverlays: data?.mapOverlays,
    selectedOverlay,
    ...query,
  };
};
