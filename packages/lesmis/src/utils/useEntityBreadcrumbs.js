/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useUrlParams } from './useUrlParams';
import { useProjectEntitiesData } from '../api';
import { makeEntityLink } from './makeEntityLink';

const getHierarchy = (entities, entityCode, view, locale, hierarchy = []) => {
  const entity = entities.find(e => e.code === entityCode);

  if (!entity) {
    return [];
  }
  const url = makeEntityLink(locale, entity.code, view);
  const newHierarchy = [{ name: entity.name, url }, ...hierarchy];

  if (entity.type === 'country') {
    return newHierarchy;
  }
  return getHierarchy(entities, entity.parentCode, view, locale, newHierarchy);
};

export const useEntityBreadcrumbs = () => {
  const { locale, entityCode, view } = useUrlParams();
  const { isLoading, data: entities = [] } = useProjectEntitiesData();
  const breadcrumbs = getHierarchy(entities, entityCode, view, locale);
  return { isLoading, breadcrumbs };
};
