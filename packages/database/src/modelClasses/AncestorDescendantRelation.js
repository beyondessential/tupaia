/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class AncestorDescendantRelationType extends DatabaseType {
  static databaseType = TYPES.ANCESTOR_DESCENDANT_RELATION;
}

export class AncestorDescendantRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return AncestorDescendantRelationType;
  }

  async getChildIdToParentId(hierarchyId) {
    const relationRecords = await this.find({
      entity_hierarchy_id: hierarchyId,
      generational_distance: 1,
    });
    return reduceToDictionary(relationRecords, 'descendant_id', 'ancestor_id');
  }
}
