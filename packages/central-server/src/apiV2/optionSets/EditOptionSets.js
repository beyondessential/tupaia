import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertOptionSetEditPermissions } from './assertOptionSetPermissions';

export class EditOptionSets extends EditHandler {
  async assertUserHasAccess() {
    const optionSetChecker = accessPolicy =>
      assertOptionSetEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, optionSetChecker]));
  }

  async editRecord() {
    return this.updateRecord();
  }
}
