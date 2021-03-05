'use strict';

import { DatabaseChangeChannel } from '../DatabaseChangeChannel';
import { markRecordsForResync } from '../utilities';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const createSelectCasesQuery = columns => {
  return `
    SELECT e.${columns}
    FROM entity e
    LEFT JOIN dhis_sync_queue dsq ON e.id = record_id
    WHERE
        dsq.id IS NULL and
        e.type = 'case';
  `;
};

const selectCasesForResync = async db => {
  const query = createSelectCasesQuery('*');
  const { rows } = await db.runSql(query);
  return rows;
};

exports.up = async function (db) {
  const changeChannel = new DatabaseChangeChannel();

  try {
    // n.b. this requires a meditrak-server instance to be running and listening for the changes
    const cases = await selectCasesForResync(db);
    await markRecordsForResync(changeChannel, 'entity', cases);
  } finally {
    changeChannel.close();
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
