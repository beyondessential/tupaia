import { DeleteHandler } from '../DeleteHandler';
import { assertBESAdminAccess } from '../../permissions';

export class DeleteMapOverlays extends DeleteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async deleteRecord() {
    const mapOverlay = await this.resourceModel.findById(this.recordId);
    const reportModel = mapOverlay.legacy ? this.models.legacyReport : this.models.report;
    await reportModel.delete({ code: mapOverlay.report_code });
    return super.deleteRecord();
  }
}
