'use strict';

import { getSyncQueueChangeTime } from '@tupaia/tsutils';
import { generateId } from '../utilities/generateId';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// Get the IDs of all user entity permissions that are not already in the sync queue
const getAllUserEntityPermissionIds = async db => {
  const result = await db.runSql(`
    SELECT user_entity_permission.id FROM user_entity_permission
    LEFT JOIN meditrak_sync_queue on meditrak_sync_queue.record_id = user_entity_permission.id
    WHERE meditrak_sync_queue.id IS NULL
  `);
  return result.rows.map(row => row.id);
};

exports.up = async function (db) {
  const userEntityPermissionIds = await getAllUserEntityPermissionIds(db);
  await db.runSql(`
    INSERT INTO meditrak_sync_queue (id, type, record_type, record_id, change_time)
    VALUES ${userEntityPermissionIds
      .map(
        (id, i) =>
          // the timestamp is incremented by i to ensure that each record has a unique timestamp
          `('${generateId()}', 'update', 'user_entity_permission', '${id}', ${getSyncQueueChangeTime(
            i,
          )})`,
      )
      .join(',\n')};
 
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
