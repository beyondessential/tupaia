import { EditHandler } from './EditHandler';
import { assertBESAdminAccess } from '../../permissions';

export class BESAdminEditHandler extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async editRecord() {
    await this.updateRecord();
  }
}
