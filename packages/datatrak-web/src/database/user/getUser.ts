import { SyncFact } from '@tupaia/constants';
import { RECORDS } from '@tupaia/database';
import { EntityRecord, ProjectRecord } from '@tupaia/tsmodels';
import { camelcaseKeys } from '@tupaia/tsutils';
import { GetUserLocalContext } from '../../api/queries/useUser';

export const getUser = async ({ models }: GetUserLocalContext) => {
  return await models.wrapInReadOnlyTransaction(async transactingModels => {
    const currentUserId = await transactingModels.localSystemFact.get(SyncFact.CURRENT_USER_ID);
    if (!currentUserId) {
      return {};
    }

    const userRecord = await transactingModels.user.findById(currentUserId);
    if (!userRecord) {
      return {};
    }

    const { preferences = {} } = userRecord;
    const { project_id: projectId, country_id: countryId } = preferences;

    const projectRecord: ProjectRecord | null = projectId
      ? await transactingModels.database.findOne(
          RECORDS.PROJECT,
          { [`${RECORDS.PROJECT}.id`]: projectId },
          {
            joinWith: RECORDS.ENTITY,
            joinCondition: ['entity.id', 'project.entity_id'],
          },
        )
      : null;
    const project = projectRecord ? camelcaseKeys(projectRecord, { deep: true }) : null;

    const country: EntityRecord | null = countryId
      ? await transactingModels.entity.findById(countryId, {
          columns: ['code', 'id', 'name'],
        })
      : null;

    return await transactingModels.user.transformUserData(userRecord, project, country);
  });
};
