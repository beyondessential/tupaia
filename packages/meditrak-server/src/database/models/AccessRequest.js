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
  if (approved) {
    await models.userCountryPermission.create({
      user_id: userId,
      country_id: countryId,
      permission_group_id: permissionGroupId,
    });
  }
}
