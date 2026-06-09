'use strict';

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

exports.up = async function (db) {
  await db.runSql(`CREATE INDEX survey_response_entity_id_idx ON survey_response (entity_id);`);
  await db.runSql(`CREATE INDEX survey_response_outdated_id_idx ON survey_response (outdated);`);
  await db.runSql(
    `CREATE INDEX survey_response_data_time_idx ON survey_response (data_time DESC);`,
  );
};

exports.down = async function (db) {
  await db.runSql(`DROP INDEX IF EXISTS survey_response_entity_id_idx;`);
  await db.runSql(`DROP INDEX IF EXISTS survey_response_outdated_id_idx;`);
  await db.runSql(`DROP INDEX IF EXISTS survey_response_data_time_idx);`);
};

exports._meta = {
  version: 1,
};
