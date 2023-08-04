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

const STRIVE_PROJECT_CODE = 'strive';

const OLD_DEFAULT_MEASURE = '126,171';

const NEW_DEFAULT_MEASURE = 'STRIVE_CRF_Positive,STRIVE_CRF_mRDT_Tests_Radius';

exports.up = function (db) {
  return db.runSql(`
    UPDATE project
    SET default_measure = '${NEW_DEFAULT_MEASURE}'
    WHERE code = '${STRIVE_PROJECT_CODE}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE project
    SET default_measure = '${OLD_DEFAULT_MEASURE}'
    WHERE code = '${STRIVE_PROJECT_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
