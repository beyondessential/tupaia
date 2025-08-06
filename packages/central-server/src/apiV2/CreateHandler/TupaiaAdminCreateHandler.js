import { CreateHandler } from './CreateHandler';
import { assertAdminPanelAccess } from '../../permissions';

export class TupaiaAdminCreateHandler extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async createRecord() {
    await this.insertRecord();
  }
}
