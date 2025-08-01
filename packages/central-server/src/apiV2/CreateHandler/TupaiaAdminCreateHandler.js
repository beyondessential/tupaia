import { CreateHandler } from './CreateHandler';
import { assertAdminPanelAccess } from '../../permissions';

export class TupaiaAdminCreateHandler extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  createRecord = this.insertRecord;
}
