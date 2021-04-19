/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import camelCase from 'camelcase';
import { get } from '../api';
import { useEntitiesData } from './useEntitiesData';

// Todo: refine which map overlays are supported on which level @see https://github.com/beyondessential/tupaia-backlog/issues/2682
const getVisibleChildren = (options, entityType) =>
  options.filter(option => {
    if (entityType !== camelCase('country')) {
      return true;
    }

    return (
      option.displayOnLevel === undefined ||
      camelCase(option.displayOnLevel) === camelCase(entityType)
    );
  });

const getOverylays = (child, entityType) => {
  if (!child.children) {
    return child;
  }

  const visibleChildren = getVisibleChildren(child.children, entityType);
  return { ...child, children: visibleChildren.map(overlay => getOverylays(overlay, entityType)) };
};

const processOverlaysData = (data, entityType) =>
  data
    .filter(overlay => getVisibleChildren(overlay.children, entityType).length > 0)
    .map(overlay => getOverylays(overlay, entityType));

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
