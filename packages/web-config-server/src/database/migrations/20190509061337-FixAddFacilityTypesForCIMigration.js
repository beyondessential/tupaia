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
  UPDATE clinic
  SET category_code = "type"
  WHERE position('CI_' in code) > 0 AND category_code IS null;

  UPDATE clinic
  SET type_name = 'Hospital'
  WHERE position('CI_' in code) > 0 AND category_code = '1';
  
  UPDATE clinic
  SET type_name = 'Community health centre'
  WHERE position('CI_' in code) > 0 AND category_code = '2';
  
  UPDATE clinic
  SET type_name = 'Clinic'
  WHERE position('CI_' in code) > 0 AND category_code = '3';
  
  UPDATE clinic
  SET type_name = 'Aid post'
  WHERE position('CI_' in code) > 0 AND category_code = '4';
`);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
