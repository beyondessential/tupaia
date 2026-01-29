import { SyncFact } from '@tupaia/constants';
import { EntityRecord, ProjectRecord } from '@tupaia/tsmodels';
import { RECORDS } from '@tupaia/database';
import { GetUserLocalContext } from '../../api/queries/useUser';

export const getUser = async ({ models }: GetUserLocalContext) => {
  const currentUserId = await models.localSystemFact.get(SyncFact.CURRENT_USER_ID);
  if (!currentUserId) {
    return {};
  }

  const userData = await models.user.findById(currentUserId);
  if (!userData) {
    return {};
  }

  const { preferences = {} } = userData;
  const { project_id: projectId, country_id: countryId } = preferences;

  let project: ProjectRecord | null = null;
  if (projectId) {
    project = await models.database.findOne(
      RECORDS.PROJECT,
      { [`${RECORDS.PROJECT}.id`]: projectId },
      {
        joinWith: RECORDS.ENTITY,
        joinCondition: ['entity.id', 'project.entity_id'],
      },
    );
  }

  let country: EntityRecord | null = null;
  if (countryId) {
    country = await models.entity.findById(countryId, { columns: ['code', 'id', 'name'] });
  }

  return await models.user.transformUserData(userData, project, country);
};
