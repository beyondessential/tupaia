'use strict';

import { generateId, insertObject } from '../utilities';

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
  const schools = (
    await db.runSql(`
      SELECT code, TRIM(code, 'LA_sch_') AS kobo_id
      FROM entity
      WHERE code LIKE 'LA_sch_%'
    `)
  ).rows;

  return schools.map(row =>
    insertObject(db, 'data_service_entity', {
      id: generateId(),
      entity_code: row.code,
      config: {
        kobo_id: row.kobo_id,
      },
    }),
  );
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM data_service_entity
    WHERE entity_code LIKE 'LA_sch_%'
  `);
};

exports._meta = {
  version: 1,
};
