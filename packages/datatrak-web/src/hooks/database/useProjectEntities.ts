import { Project, EntityRecord } from '@tupaia/types';
import { ResultObject, useDatabaseEffect } from './useDatabaseEffect';

export const useProjectEntities = (
  projectCode?: Project['code'],
  criteria?: any,
  options?: any,
): ResultObject<EntityRecord[]> =>
  useDatabaseEffect(
    async models => {
      console.log('projectCode', projectCode);
      console.log('criteria', criteria);
      console.log('options', options);
      if (!projectCode) {
        return [];
      }

      console.log('yaaaaa');

      const project = await models.project.findOne({ code: projectCode });

      // Should never happen, but just in case
      if (!project.entity_hierarchy_id || !project.entity_id) {
        throw new Error('Project does not have an entity hierarchy or entity');
      }

      console.log('yoooooo');
      return models.entity.getDescendantsFromParentChildRelation(
        project.entity_hierarchy_id,
        [project.entity_id],
        criteria,
        // options,
      );
    },
    [projectCode, JSON.stringify(options)],
    options,
  );
