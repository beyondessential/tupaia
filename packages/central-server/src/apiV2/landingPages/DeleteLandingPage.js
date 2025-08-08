import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { DeleteHandler } from '../DeleteHandler';
import { assertUserHasAccessToLandingPage } from './assertUserHasAccessToLandingPage';

export class DeleteLandingPage extends DeleteHandler {
  async assertUserHasAccess() {
    const landingPageChecker = accessPolicy =>
      assertUserHasAccessToLandingPage(this.models, accessPolicy, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, landingPageChecker]));
  }

  async deleteRecord() {
    await this.models.landingPage.deleteById(this.recordId);
  }
}
