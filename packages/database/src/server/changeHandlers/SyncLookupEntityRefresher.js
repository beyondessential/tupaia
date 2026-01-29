import { SqlQuery } from '../../core';
import { ChangeHandler } from './ChangeHandler';

export class SyncLookupEntityRefresher extends ChangeHandler {
  constructor(models) {
    super(models, 'sync-lookup-entity-refresher');

    this.changeTranslators = {
      entityParentChildRelation: change => this.getAffectedEntityIds(change),
    };
  }

  getAffectedEntityIds(changeDetails) {
    const { new_record: newRecord, old_record: oldRecord } = changeDetails;
    const affectedEntityIds = [
      oldRecord?.child_id,
      oldRecord?.parent_id,
      newRecord?.child_id,
      newRecord?.parent_id,
    ].filter(Boolean);

    return affectedEntityIds;
  }

  async handleChanges(models, affectedEntityIds) {
    const entityIdsArray = [...new Set(affectedEntityIds)];

    if (entityIdsArray.length === 0) {
      return;
    }

    await models.database.executeSql(
      `
        UPDATE entity
        SET updated_at_sync_tick = 1
        WHERE id IN ${SqlQuery.record(entityIdsArray)}
    `,
      entityIdsArray,
    );
  }
}
