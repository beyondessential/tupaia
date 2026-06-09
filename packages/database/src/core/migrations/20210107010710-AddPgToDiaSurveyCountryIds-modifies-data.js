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

const countryId = '5c807c0df013d67ad51071c4'; // Papua New Guinea (PG)

exports.up = async function (db) {
  await db.runSql(`
    update survey
    set country_ids = country_ids || '{${countryId}}'
    where code = 'DIA';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    update survey
    set country_ids = array_remove(country_ids, '${countryId}')
    where code = 'DIA';
  `);
};

exports._meta = {
  version: 1,
};
