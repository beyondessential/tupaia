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

  async getChildIdToParentIdMap(hierarchyId) {
    return reduceToDictionary(
      await this.find(
        { entity_hierarchy_id: hierarchyId, generational_distance: 1 },
        { columns: [{ child_id: 'descendant_id', parent_id: 'ancestor_id' }] },
      ),
      'child_id',
      'parent_id',
    );
  }
}
