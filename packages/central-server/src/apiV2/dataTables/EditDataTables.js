import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertVizBuilderAccess,
} from '../../permissions';
import { EditHandler } from '../EditHandler';
import { assertDataTableEditPermissions } from './assertDataTablePermissions';

export class EditDataTables extends EditHandler {
  async assertUserHasAccess() {
    const assertEditDataTablePermissions = accessPolicy =>
      assertDataTableEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(
      assertAnyPermissions([
        assertBESAdminAccess,
        assertAllPermissions([assertVizBuilderAccess, assertEditDataTablePermissions]),
      ]),
    );
  }

  async editRecord() {
    await this.updateRecord();
  }
}
