/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessRequestModel as CommonAccessRequestModel } from '@tupaia/database';

export class AccessRequestModel extends CommonAccessRequestModel {
  notifiers = [onApproveCreateUserCountryPermission];
}

async function onApproveCreateUserCountryPermission(
  {
    record: {
      approved,
      user_id: userId,
      entity_id: entityId,
      permission_group_id: permissionGroupId,
    },
  },
  models,
) {
  const data = {
    user_id: userId,
    entity_id: entityId,
    permission_group_id: permissionGroupId,
  };

  if (approved) {
    const userEntityPermission = await models.userEntityPermission.findOne(data);
    if (userEntityPermission !== null) {
      throw new Error(`User already has this permission`);
    }

    await models.userEntityPermission.create(data);
  }
}
