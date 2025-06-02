'use strict';

var dbm;
var type;
var seed;

const facilityCode = 'KI_Bwentekota';

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
  const facilityEntity = await db.runSql(`
    SELECT "id" FROM "entity" WHERE "code" = '${facilityCode}';
  `);

  const facilityEntityId = facilityEntity.rows[0].id;

  await db.runSql(`
    DELETE FROM "entity_relation"
    WHERE "child_id" = '${facilityEntityId}';

    DELETE FROM "entity"
    WHERE "code" = '${facilityCode}';

    DELETE FROM "clinic"
    WHERE "code" = '${facilityCode}';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
