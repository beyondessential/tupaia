import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { buildSyncLookupSelect } from '../sync';

export class EntityParentChildRelationRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY_PARENT_CHILD_RELATION;
}

export class EntityParentChildRelationModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

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
