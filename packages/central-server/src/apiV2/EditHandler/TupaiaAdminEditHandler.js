import { EditHandler } from './EditHandler';
import { assertAdminPanelAccess } from '../../permissions';

export class TupaiaAdminEditHandler extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async editRecord() {
    await this.updateRecord();
  }
}
