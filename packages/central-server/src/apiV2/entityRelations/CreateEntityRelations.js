/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertAdminPanelAccess,
  assertBESAdminAccess,
} from '../../permissions';

export class CreateEntityRelations extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to create an entity relation',
      ),
    );
  }

  async createRecord() {
    return this.insertRecord();
  }

  async validate() {
    const { parent_id, child_id, entity_hierarchy_id } = this.newRecordData;
    const entityRelation = await this.models.entityRelation.findOne({
      parent_id,
      child_id,
      entity_hierarchy_id,
    });

    if (entityRelation) {
      throw new Error('Entity relation already exists');
    }

    return this.validateNewRecord();
  }
}
