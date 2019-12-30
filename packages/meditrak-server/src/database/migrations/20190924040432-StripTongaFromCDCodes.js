'use strict';

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

exports.up = function(db) {
  return db.runSql(`
    UPDATE question
      SET code = 'DIA' || substring(code, 3)
      WHERE code LIKE 'CD%';

    UPDATE survey
      SET code = 'DIA'
      WHERE code = 'CD';

    UPDATE question
      SET code = substring(code, 7)
      WHERE code LIKE 'Tonga_%';

    UPDATE survey
      SET code = substring(code, 7)
      WHERE code LIKE 'Tonga_%';

    UPDATE dhis_sync_log
      SET data = '{"program":"DIA"' || substring(data, 16)
      WHERE data LIKE '{"program":"CD"%';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE survey
      SET code = 'Tonga_' || code
      WHERE code LIKE 'CD%';

    UPDATE question
      SET code = 'Tonga_' || code
      WHERE code LIKE 'CD%';

    UPDATE survey
      SET code = 'CD'
      WHERE code = 'DIA';

    UPDATE question
      SET code = 'CD' || substring(code, 4)
      WHERE code LIKE 'DIA%';

    UPDATE dhis_sync_log
      SET data = '{"program":"CD"' || substring(data, 17)
      WHERE data LIKE '{"program":"DIA"%';
  `);
};

exports._meta = {
  version: 1,
};
