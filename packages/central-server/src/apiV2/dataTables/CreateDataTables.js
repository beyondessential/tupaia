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
        'BES Admin or Viz Builder User permission required to create a data table',
      ),
    );
  }

  async createRecord() {
    await this.insertRecord();
  }
}
