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

  const { id: projectId } = await models.project.findOneOrThrow(
    { code: projectCode },
    { columns: ['id'] },
    `No project exists with code ${projectCode}`,
  );

  const entity = await models.entity.findOneOrThrow({ code: entityCode });
  const ancestors = await models.entity.getAncestorsFromParentChildRelation(
    projectId,
    [entity.id],
    {
      fields: ENTITY_ANCESTORS_DEFAULT_FIELDS.filter(field => !isExtendedField(field)),
    },
  );

  // Always include the root entity
  const entities = [entity, ...ancestors];

  const formattedEntities = await formatEntitiesForResponse(
    { projectId },
    entities,
    ENTITY_ANCESTORS_DEFAULT_FIELDS,
  );

  return camelcaseKeys(formattedEntities, { deep: true });
};
