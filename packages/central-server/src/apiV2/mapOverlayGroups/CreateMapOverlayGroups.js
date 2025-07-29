import { CreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertVizBuilderAccess,
} from '../../permissions';

export class CreateMapOverlayGroups extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertVizBuilderAccess],
        'BES Admin or Viz Builder User permission required to create a map overlay group',
      ),
    );
  }

  async createRecord() {
    return this.insertRecord();
  }
}
