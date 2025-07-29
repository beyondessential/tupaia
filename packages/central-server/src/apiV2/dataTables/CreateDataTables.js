import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertVizBuilderAccess,
} from '../../permissions';
import { CreateHandler } from '../CreateHandler';

export class CreateDataTables extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertVizBuilderAccess],
        'You need either BES Admin or Viz Builder User permission to create a data table',
      ),
    );
  }

  async createRecord() {
    await this.insertRecord();
  }
}
