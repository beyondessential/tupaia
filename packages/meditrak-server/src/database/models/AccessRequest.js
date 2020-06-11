/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AccessRequestModel as CommonAccessRequestModel } from '@tupaia/database';

export class AccessRequestModel extends CommonAccessRequestModel {
  notifiers = [onCreateCreateUserCountryPermission];
}

async function onCreateCreateUserCountryPermission(
  {
    record: {
      approved,
      user_id: userId,
      country_id: countryId,
      permission_group_id: permissionGroupId,
    },
  },
  models,
) {
  const data = {
    user_id: userId,
    country_id: countryId,
    permission_group_id: permissionGroupId,
  };

  if (approved) {
    const userCountryPermission = await models.userCountryPermission.findOne(data);
    if (userCountryPermission !== null) {
      throw new Error(`User Country Permission already exists`);
    }

    await models.userCountryPermission.create(data);
  }
}
