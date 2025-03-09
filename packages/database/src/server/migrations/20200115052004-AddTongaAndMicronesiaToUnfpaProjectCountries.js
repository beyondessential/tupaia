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
  const tonga = await db.runSql(`select id from entity where code = 'TO'`);
  const micronesia = await db.runSql(`select id from entity where code = 'FM'`);

  return db.runSql(`
    UPDATE "project"
      SET "entity_ids" = "entity_ids" || '{"${tonga.rows[0].id}", "${micronesia.rows[0].id}"}'
        WHERE "code" = 'unfpa';
  `);
};

exports.down = async function (db) {
  const tonga = await db.runSql(`select id from entity where code = 'TO'`);
  const micronesia = await db.runSql(`select id from entity where code = 'FM'`);

  return db.runSql(`
    update project set entity_ids = array_remove(entity_ids, '${tonga.rows[0].id}') where code = 'unfpa';
    update project set entity_ids = array_remove(entity_ids, '${micronesia.rows[0].id}') where code = 'unfpa';
  `);
};

exports._meta = {
  version: 1,
};
