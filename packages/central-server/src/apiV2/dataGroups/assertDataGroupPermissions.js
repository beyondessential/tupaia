/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';

const { RAW } = QUERY_CONJUNCTIONS;

const getPermissionListWithWildcard = async accessPolicy => {
  const userPermissionGroups = accessPolicy.getPermissionGroups();
  return ['*', ...userPermissionGroups];
};

export const assertDataGroupGETPermissions = async (accessPolicy, models, dataGroupId) => {
  if (await assertDataGroupPermissions(accessPolicy, models, dataGroupId, 'some')) {
    return true;
  }
  throw new Error('Viewing a data group requires access to all the data elements within');
};

export const assertDataGroupEditPermissions = async (accessPolicy, models, dataGroupId) => {
  if (await assertDataGroupPermissions(accessPolicy, models, dataGroupId, 'every')) {
    return true;
  }
  throw new Error('Editing a data group requires full access to all the data elements within');
};

const assertDataGroupPermissions = async (accessPolicy, models, dataGroupId, test) => {
  const dataGroup = await models.dataGroup.findById(dataGroupId);
  if (!dataGroup) {
    throw new Error(`No data group exists with id ${dataGroupId}`);
  }
  const userPermissions = await getPermissionListWithWildcard(accessPolicy);
  const dataElements = await models.dataGroup.getDataElementsInDataGroup(dataGroup.code);
  // Loop through child data elements and check we have any/all of the permissions for it
  for (const element of dataElements) {
    if (
      element.permission_groups.length <= 0 ||
      element.permission_groups[test](code => userPermissions.includes(code))
    ) {
      continue;
    }
    return false;
  }
  return true;
};

export const createDataGroupDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = { ...criteria };
  const userPermissions = await getPermissionListWithWildcard(accessPolicy);

  // Fetch data_groups where all child data_element.permission_groups have overlap with our permissions
  dbConditions[RAW] = {
    sql: `
      data_group.id IN (
        SELECT data_group_id FROM data_element_data_group
        INNER JOIN data_element
        ON data_element.id = data_element_data_group.data_element_id
        GROUP BY data_group_id
        HAVING bool_and(permission_groups && array[${userPermissions.map(() => '?').join(',')}])
      )
    `,
    parameters: userPermissions,
  };

  return dbConditions;
};
