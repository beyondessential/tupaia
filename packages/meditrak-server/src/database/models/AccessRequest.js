/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES, AccessRequestModel as CommonAccessRequestModel } from '@tupaia/database';

const { ACCESS_REQUEST, PERMISSION_GROUP } = TYPES;

export class AccessRequestModel extends CommonAccessRequestModel {
  notifiers = [onCreateCreateUserCountryPermission];
}

async function onCreateCreateUserCountryPermission({ record }, models) {
  console.log('onCreateCreateUserCountryPermission');
  console.log(record);

  const [userCountryPermissionData] = await models.database.find(
    ACCESS_REQUEST,
    { [`${ACCESS_REQUEST}.id`]: record.id, approved: true },
    {
      columns: ['user_id', 'country_id', { permission_group_id: 'permission_group.id' }],
      multiJoin: [
        {
          joinWith: PERMISSION_GROUP,
          joinCondition: [`${ACCESS_REQUEST}.permission_group`, `${PERMISSION_GROUP}.name`],
        },
      ],
    },
  );

  await models.userCountryPermission.create(userCountryPermissionData);
}
