import { EntityTypeEnum } from '@tupaia/types';
import { useProjectEntitiesData } from '../api';
import { makeEntityLink } from './makeEntityLink';
import { useUrlParams } from './useUrlParams';

const getHierarchy = (entities, entityCode, view, hierarchy = []) => {
  const entity = entities.find(e => e.code === entityCode);

  if (!entity) {
    return [];
  }
  const url = makeEntityLink(entity.code, view);
  const newHierarchy = [{ name: entity.name, url }, ...hierarchy];

  if (entity.type === EntityTypeEnum.country) {
    return newHierarchy;
  }
  return getHierarchy(entities, entity.parentCode, view, newHierarchy);
};

export const useEntityBreadcrumbs = () => {
  const { entityCode, view } = useUrlParams();
  const { isLoading, data: entities = [] } = useProjectEntitiesData();
  const breadcrumbs = getHierarchy(entities, entityCode, view);
  return { isLoading, breadcrumbs };
};
