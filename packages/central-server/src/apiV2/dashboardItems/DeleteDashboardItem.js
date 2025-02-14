import { DeleteHandler } from '../DeleteHandler';
import { assertBESAdminAccess } from '../../permissions';

export class DeleteDashboardItem extends DeleteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async deleteRecord() {
    const dashboardItem = await this.resourceModel.findById(this.recordId);
    if (dashboardItem.report_code) {
      const reportModel = dashboardItem.legacy ? this.models.legacyReport : this.models.report;
      await reportModel.delete({ code: dashboardItem.report_code });
    }
    return super.deleteRecord();
  }
}
