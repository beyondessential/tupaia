import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertLegacyReportEditPermissions } from './assertLegacyReportsPermissions';

export class EditLegacyReport extends EditHandler {
  async assertUserHasAccess() {
    const legacyReportChecker = accessPolicy =>
      assertLegacyReportEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, legacyReportChecker]));
  }

  async editRecord() {
    await this.updateRecord();
  }
}
