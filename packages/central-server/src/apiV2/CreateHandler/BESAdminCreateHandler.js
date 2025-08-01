import { CreateHandler } from './CreateHandler';
import { assertBESAdminAccess } from '../../permissions';

export class BESAdminCreateHandler extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  createRecord = this.insertRecord;
}
