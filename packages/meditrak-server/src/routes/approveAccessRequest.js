/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { TYPES } from '@tupaia/database';
import { respond } from '@tupaia/utils';
const { ACCESS_REQUEST, PERMISSION_GROUP } = TYPES;

export const approveAccessRequest = async (req, res) => {
  const {
    params: { id },
    body,
    models,
  } = req;

  await models.accessRequest.update({ id }, body);

  if (body.approved) {
    const [userCountryPermissionData] = await models.database.find(
      TYPES.ACCESS_REQUEST,
      { [`${ACCESS_REQUEST}.id`]: id, approved: true },
      {
        columns: ['user_id', 'country_id', { permission_group_id: 'permission_group.id' }],
        multiJoin: [
          {
            joinWith: TYPES.PERMISSION_GROUP,
            joinCondition: [`${ACCESS_REQUEST}.permission_group`, `${PERMISSION_GROUP}.name`],
          },
        ],
      },
    );

    await models.userCountryPermission.create(userCountryPermissionData);
  }

  respond(res, { success: true });
};
