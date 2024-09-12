/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from '@tanstack/react-query';
import camelCase from 'camelcase';
import { get } from '../api';
import { useEntitiesData } from './useEntitiesData';

// Todo: refine which map overlays are supported on which level @see https://github.com/beyondessential/tupaia-backlog/issues/2682
const getIsOverlayVisible = (overlay, entityType) => {
  if (camelCase(entityType) !== 'country') {
    return true;
  }

  return (
    overlay.displayOnLevel === undefined ||
    camelCase(overlay.displayOnLevel) === camelCase(entityType)
  );
};

const getOverlays = (child, entityType) => {
  if (!child.children) {
    // leaf node, i.e. overlay rather than group
    // check if it is visible at this entity level
    return getIsOverlayVisible(child, entityType) ? child : null;
  }

  const children = child.children.map(overlay => getOverlays(overlay, entityType)).filter(o => !!o);
  if (children.length === 0) {
    return null; // this has no visible children, so don't show
  }
  return { ...child, children };
};

const processOverlaysData = (data, entityType) =>
  data.map(overlay => getOverlays(overlay, entityType)).filter(o => !!o);

export const findOverlay = (overlays, code) => {
  for (const overlayObject of overlays) {
    if (overlayObject?.mapOverlayCode === code) {
      return overlayObject;
    }
    if (overlayObject?.children) {
      const result = findOverlay(overlayObject.children, code);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

export const useMapOverlaysData = ({ entityCode }) => {
  const { entitiesByCode, isLoading: entitiesLoading } = useEntitiesData(entityCode);

  const entityData = entitiesByCode[entityCode];

  const query = useQuery(['overlays', entityCode], () => get(`map-overlays/${entityCode}`), {
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!entityData,
  });

  const processedData = query.data ? processOverlaysData(query.data, entityData.type) : [];

  return { ...query, data: processedData, isLoading: entitiesLoading || query.isLoading };
};
