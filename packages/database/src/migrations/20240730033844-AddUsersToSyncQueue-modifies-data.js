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
const getAllUserIds = async db => {
  const result = await db.runSql(`
    SELECT user_account.id FROM user_account
    LEFT JOIN meditrak_sync_queue on meditrak_sync_queue.record_id = user_account.id
    WHERE meditrak_sync_queue.id IS NULL
  `);
  return result.rows.map(row => row.id);
};

exports.up = async function (db) {
  const userIds = await getAllUserIds(db);
  if (userIds.length === 0) {
    return;
  }
  await db.runSql(`
    INSERT INTO meditrak_sync_queue (id, type, record_type, record_id, change_time)
    VALUES ${userIds
      .map(
        (id, i) =>
          // the timestamp is incremented by i to ensure that each record has a unique timestamp
          `('${generateId()}', 'update', 'user_account', '${id}', ${getSyncQueueChangeTime(i)})`,
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
