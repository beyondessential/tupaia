import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertOptionSetEditPermissions } from './assertOptionSetPermissions';

export class DeleteOptionSets extends DeleteHandler {
  async assertUserHasAccess() {
    const optionSetChecker = accessPolicy =>
      assertOptionSetEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, optionSetChecker]));
  }
}
