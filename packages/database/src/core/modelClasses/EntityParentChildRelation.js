import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { buildSyncLookupSelect } from '../sync';

// TUP-3065: closure cache retired. Nothing writes to entity_parent_child_relation
// post-3065, and no direct caller queries it. The class survives only because the
// model is still wired into the sync framework — flipping syncDirection to
// DO_NOT_SYNC would change the sync contract with in-flight datatrak clients, so
// disposal is bundled with the DROP TABLE in TUP-3066.
export class EntityParentChildRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY_PARENT_CHILD_RELATION;
}

export class EntityParentChildRelationModel extends DatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  get DatabaseRecordClass() {
    return EntityParentChildRelationRecord;
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: `ARRAY[project.id]`,
      }),
      joins: `
        LEFT JOIN project ON project.entity_hierarchy_id = entity_parent_child_relation.entity_hierarchy_id
      `,
    };
  }
}
