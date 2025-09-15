import { EntityTypeEnum } from '@tupaia/types';
import { DatatrakWebServerModelRegistry } from '../types';

export const getParentEntityName = async (
  models: DatatrakWebServerModelRegistry,
  projectId: string,
  entityId: string,
) => {
  const entity = await models.entity.findById(entityId);

  if (!entity) {
    throw new Error(`Entity with id ${entityId} not found`);
  }

  const project = await models.project.findById(projectId);

  if (!project) {
    throw new Error(`Project with id ${projectId} not found`);
  }

  const entityAncestors =
    project.entity_hierarchy_id && entity.type !== EntityTypeEnum.country
      ? await entity.getAncestors(project.entity_hierarchy_id, {
          generational_distance: 1,
        })
      : [];
  return entityAncestors[0]?.name;
};
