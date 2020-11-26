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

exports.up = async function(db) {
  await db.runSql(`
    update survey
    set country_ids = country_ids || '{5c807c0df013d67ad51071c4}'
    where code = 'DIA';
  `);

  return db.runSql(`
    update "dashboardReport" 
    set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{surveys,2,code}', '"DIA"') 
    where id = 'Raw_Data_Core_Surveys';
`);
};

exports.down = async function(db) {
  await db.runSql(`
    update survey
    set country_ids = array_remove(country_ids, '5c807c0df013d67ad51071c4')
    where code = 'DIA';
  `);

  return db.runSql(`
    update "dashboardReport" 
    set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{surveys,2,code}', '"CD"') 
    where id = 'Raw_Data_Core_Surveys';
  `);
};

exports._meta = {
  "version": 1
};
