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

const ENTITIES_TO_BE_DELETED = [
  'PG_f-2OD-0Z2-Z5RZ',
  'PG_f-456-ZEQ-IEST',
  'PG_f-578-6F8-1MY4',
  'PG_f-A47-M56-IGMD',
  'PG_f-AFX-8US-AXM7',
  'PG_f-FFA-YDF-FW40',
  'PG_f-PBQ-1ES-5C4J',
  'PG_f-Q4W-YX7-LNGT',
  'PG_f-RX3-L7X-ZUFN',
  'PG_f-TCH-M7C-86TR',
];

exports.up = async function (db) {
  await db.runSql(
    `DELETE FROM survey_response WHERE entity_id IN (SELECT id FROM entity WHERE code IN ('${ENTITIES_TO_BE_DELETED.join(
      `','`,
    )}'))`,
  );
  await db.runSql(`DELETE FROM entity WHERE code IN ('${ENTITIES_TO_BE_DELETED.join(`','`)}')`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
