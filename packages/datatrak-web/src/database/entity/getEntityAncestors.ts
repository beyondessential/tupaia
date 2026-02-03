import { ENTITY_ANCESTORS_DEFAULT_FIELDS } from '@tupaia/constants';
import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import type { UseEntityAncestorsLocalContext } from '../../api/queries/useEntityAncestors';
import { isExtendedField } from '../../utils/extendedFieldFunctions';
import { formatEntitiesForResponse } from '../../utils/formatEntity';

export const getEntityAncestors = async ({
  models,
  projectCode,
  entityCode,
}: UseEntityAncestorsLocalContext) => {
  const project = ensure(
    await models.project.findOne({ code: ensure(projectCode) }),
    `No project exists with code ${projectCode}`,
  );

  // This should never happen, but just in case
  if (!project.entity_hierarchy_id) {
    throw new Error('Project entity hierarchy ID is not set');
  }

  const entity = ensure(
    await models.entity.findOne({ code: ensure(entityCode) }),
    `No entity exists with code ${entityCode}`,
  );

  const ancestors = await models.entity.getAncestorsFromParentChildRelation(
    project.entity_hierarchy_id,
    [entity.id],
    {
      fields: ENTITY_ANCESTORS_DEFAULT_FIELDS.filter(field => !isExtendedField(field)),
    },
  );

  // Always include the root entity
  const entities = [entity, ...ancestors];

  const formattedEntities = await formatEntitiesForResponse(
    { hierarchyId: project.entity_hierarchy_id },
    entities,
    ENTITY_ANCESTORS_DEFAULT_FIELDS,
  );

  return camelcaseKeys(formattedEntities, { deep: true });
};
