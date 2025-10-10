import { CountryRecord, ProjectRecord } from '@tupaia/tsmodels';
import { FACT_CURRENT_USER_ID } from '@tupaia/constants';

import { GetUserLocalContext } from '../../api/queries/useUser';
import { RECORDS } from '@tupaia/database';

export const getUser = async ({ models }: GetUserLocalContext) => {
  const currentUserId = await models.localSystemFact.get(FACT_CURRENT_USER_ID);
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
  let country: CountryRecord | null = null;
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
  if (countryId) {
    const countryResponse = await models.country.findById(countryId);
    country = countryResponse || null;
  }

  return await models.user.transformUserData(userData, project, country);
};
