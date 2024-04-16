/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';
import { TupaiaAdminEditHandler } from '../EditHandler';

const assertAdminPanelAccessToCountry = async (accessPolicy, models, recordId) => {
  const entity = await models.entity.findById(recordId);
  if (!entity) throw new Error(`No entity found with id ${recordId}`);

  const userHasAdminAccessToCountry = accessPolicy.allows(
    entity.country_code,
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );
  if (!userHasAdminAccessToCountry) {
    throw new Error(
      `Need Tupaia Admin Panel access to country '${entity.country_code}' to edit entity`,
    );
  }
  return true;
};

export class EditEntity extends TupaiaAdminEditHandler {
  async assertUserHasAccess() {
    const permissionChecker = accessPolicy =>
      assertAdminPanelAccessToCountry(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(permissionChecker);
  }

  async updateRecord() {
    // ensure only name field can be updated
    const updatedFieldKeys = Object.keys(this.updatedFields);
    if (updatedFieldKeys.length !== 1 && updatedFieldKeys.includes('name')) {
      throw Error('Fields other than "name" cannot be updated');
    }
    await this.models.entity.updateById(this.recordId, this.updatedFields);
  }
}
