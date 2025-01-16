import { CreateHandler } from './CreateHandler';
import { assertBESAdminAccess } from '../../permissions';

export class BESAdminCreateHandler extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async createRecord() {
    await this.insertRecord();
  }
}
