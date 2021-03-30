/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useUrlParams } from './useUrlParams';
import { useEntitiesData } from '../api';

const getHierarchy = (entities, entityCode, hierarchy = []) => {
  const entity = entities.find(e => e.code === entityCode);

  if (!entity) {
    return [];
  }

  const newHierarchy = [entity, ...hierarchy];

  if (entity.type === 'country') {
    return newHierarchy;
  }
  return getHierarchy(entities, entity.parentCode, newHierarchy);
};

export const useBreadcrumbs = () => {
  const { entityCode } = useUrlParams();
  const { isLoading, data: entities = [] } = useEntitiesData();
  const breadcrumbs = getHierarchy(entities, entityCode);
  return { isLoading, breadcrumbs };
};
