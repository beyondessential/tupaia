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

const DATA_SETS = [
  ['riverine puddle', 'Riverine Puddle'],
  ['pig wallow', 'Pig Wallow'],
  ['transient puddle', 'Transient Puddle'],
  ['tyre tracks', 'Tyre Tracks'],
  ['permanent ground water', 'Permanent Ground Water'],
  ['sand-barred stream outlet', 'Sand-barred Stream Outlet'],
  ['coastal stream', 'Coastal Stream'],
  ['forest swamp', 'Forest Swamp'],
  ['drainage channel', 'Drainage Channel'],
  ['tree hole', 'Tree Hole'],
  ['artificial containers', 'Artificial Containers'],
  ['drainage', 'Drainage'],
  ['coconut shells', 'Coconut Shells'],
  ['river', 'River'],
  ['others (comment)', 'Others'],
];

const QUESTION_CODE = 'STRVEC_LHS36';

exports.up = async function (db) {
  for (const [original, capitalised] of DATA_SETS) {
    await db.runSql(`
        UPDATE answer
        SET text = '${capitalised}'
        WHERE question_id = (SELECT q.id FROM question q WHERE q.code = '${QUESTION_CODE}') and text = '${original}'
    `);
  }
};

exports.down = async function (db) {
  for (const [original, capitalised] of DATA_SETS) {
    await db.runSql(`
        UPDATE answer
        SET text = '${original}'
        WHERE question_id = (SELECT q.id FROM question q WHERE q.code = '${QUESTION_CODE}') and text = '${capitalised}'
    `);
  }
};

exports._meta = {
  version: 1,
};
