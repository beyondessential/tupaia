import {
  assertAdminPanelAccessToCountry,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';
import { TupaiaAdminEditHandler } from '../EditHandler';

export class EditEntity extends TupaiaAdminEditHandler {
  async assertUserHasAccess() {
    const permissionChecker = accessPolicy =>
      assertAdminPanelAccessToCountry(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, permissionChecker]));
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
