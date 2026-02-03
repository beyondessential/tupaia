import { ENTITY_ANCESTORS_DEFAULT_FIELDS } from '@tupaia/constants';
import { assertIsNotNullish, camelcaseKeys } from '@tupaia/tsutils';
import type { UseEntityAncestorsLocalContext } from '../../api/queries/useEntityAncestors';
import { isExtendedField } from '../../utils/extendedFieldFunctions';
import { formatEntitiesForResponse } from '../../utils/formatEntity';

export const getEntityAncestors = async ({
  models,
  projectCode,
  entityCode,
}: UseEntityAncestorsLocalContext) => {
  assertIsNotNullish(
    projectCode,
    'getEntityAncestors query function called with undefined projectCode',
  );
  assertIsNotNullish(
    entityCode,
    'getEntityAncestors query function called with undefined entityCode',
  );

  const { entity_hierarchy_id: hierarchyId } = await models.project.findOneOrThrow(
    { code: projectCode },
    { columns: ['entity_hierarchy_id'] },
    `No project exists with code ${projectCode}`,
  );

  // This should never happen, but just in case
  if (!hierarchyId) {
    throw new Error('Project entity hierarchy ID is not set');
  }

  const entity = await models.entity.findOneOrThrow({ code: entityCode });
  const ancestors = await models.entity.getAncestorsFromParentChildRelation(
    hierarchyId,
    [entity.id],
    {
      fields: ENTITY_ANCESTORS_DEFAULT_FIELDS.filter(field => !isExtendedField(field)),
    },
  );

  // Always include the root entity
  const entities = [entity, ...ancestors];

  const formattedEntities = await formatEntitiesForResponse(
    { hierarchyId: hierarchyId },
    entities,
    ENTITY_ANCESTORS_DEFAULT_FIELDS,
  );

  return camelcaseKeys(formattedEntities, { deep: true });
};
