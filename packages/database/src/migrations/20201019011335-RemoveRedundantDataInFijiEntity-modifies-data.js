'use strict';

var dbm;
var type;
var seed;
const redundantEntityName = 'Colonial War Memorial Hospital ';
const mergeEntityName = 'CWMH Suva Hospital';
/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await db.runSql(`
       update survey_response 
       set entity_id = (select id from entity e
                            where e.name = '${mergeEntityName}')
       where entity_id = (select id FROM entity e
                            where e.name = '${redundantEntityName}')
  `);

  await db.runSql(`
      delete from entity
      where name = '${redundantEntityName}'
  `);

  return db.runSql(`
      delete from clinic
      where name = '${redundantEntityName}'
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
