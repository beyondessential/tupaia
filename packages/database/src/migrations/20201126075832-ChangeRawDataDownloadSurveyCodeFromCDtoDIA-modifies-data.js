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

const reportIds = `'Raw_Data_CK_Surveys',
                  'Raw_Data_DL_Surveys',
                  'Raw_Data_VU_Surveys',
                  'Raw_Data_TL_Surveys',
                  'Raw_Data_KI_Surveys',
                  'Raw_Data_TK_Surveys',
                  'Raw_Data_SB_Surveys',
                  'Raw_Data_VE_Surveys',
                  'Raw_Data_TO_Surveys'`;

exports.up = function(db) {
  return db.runSql(`
    update "dashboardReport" 
    set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{surveys,2,code}', '"DIA"') 
    where id in (${reportIds});
  `);
};

exports.down = function(db) {
  return db.runSql(`
    update "dashboardReport" 
    set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{surveys,2,code}', '"CD"') 
    where id in (${reportIds});
  `);
};

exports._meta = {
  "version": 1
};
