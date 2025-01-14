import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertOptionEditPermissions } from './assertOptionPermissions';

export class DeleteOptions extends DeleteHandler {
  async assertUserHasAccess() {
    const optionChecker = accessPolicy =>
      assertOptionEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, optionChecker]));
  }
}
