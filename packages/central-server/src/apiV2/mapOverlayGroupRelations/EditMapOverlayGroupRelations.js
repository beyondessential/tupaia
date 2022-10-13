/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertMapOverlayGroupRelationsEditPermissions } from './assertMapOverlayGroupRelationsPermissions';
import { getChildType } from './getChildType';

export class EditMapOverlayGroupRelations extends EditHandler {
  async assertUserHasAccess() {
    const mapOverlayChecker = accessPolicy =>
      assertMapOverlayGroupRelationsEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));
  }

  async editRecord() {
    if (this.updatedFields.child_id) {
      const childType = await getChildType(this.models, this.updatedFields.child_id);
      this.updatedFields.child_type = childType;
    }
    await this.updateRecord();
  }
}
