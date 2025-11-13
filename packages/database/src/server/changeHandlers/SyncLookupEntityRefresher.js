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

    // if the entity was deleted, we need to refresh the lookup for the parent and child
    if (oldRecord && !newRecord) {
      return [oldRecord.child_id, oldRecord.parent_id];
    }

    // if the entity was created, we need to refresh the lookup for the parent and child
    return [oldRecord.child_id, oldRecord.parent_id, newRecord.child_id, newRecord.parent_id];
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
