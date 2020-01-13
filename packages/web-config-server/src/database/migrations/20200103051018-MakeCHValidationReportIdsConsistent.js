'use strict';

import { replaceArrayValue } from '../migrationUtilities';

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

const replaceId = async (db, oldId, newId) => {
  await replaceArrayValue(
    db,
    'dashboardGroup',
    'dashboardReports',
    oldId,
    newId,
    `id IN ('37', '38')`,
  );

  return db.runSql(`
    UPDATE "dashboardReport" SET id = '${newId}' WHERE id = '${oldId}';
  `);
};

exports.up = async function(db) {
  await replaceId(db, 'TO_CH_Validation_CH_4', 'TO_CH_Validation_CH4');
  return replaceId(db, 'TO_CH_Validation_CH_11', 'TO_CH_Validation_CH11');
};

exports.down = async function(db) {
  await replaceId(db, 'TO_CH_Validation_CH4', 'TO_CH_Validation_CH_4');
  return replaceId(db, 'TO_CH_Validation_CH11', 'TO_CH_Validation_CH_11');
};

exports._meta = {
  version: 1,
};
