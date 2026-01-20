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

const oldReportId = 'Raw_Data_Core_Surveys';
const newReportId = 'Raw_Data_WS_Surveys';
const dashboardGroupId = '183';

exports.up = function (db) {
  return db.runSql(`
     
    insert into "dashboardReport" 
      select '${newReportId}' as id, 
              dr."drillDownLevel", 
              dr."dataBuilder", 
              jsonb_set(dr."dataBuilderConfig", '{surveys,0,code}', '"BCDS"'), 
              dr."viewJson", 
              dr."dataServices" 
      from "dashboardReport" dr 
      where dr.id = '${oldReportId}';
    
    update "dashboardGroup" 
      set "dashboardReports" = array_remove("dashboardReports", '${oldReportId}') || '{${newReportId}}'
      where id = '${dashboardGroupId}'
`);
};

exports.down = function (db) {
  return db.runSql(`
  
  update "dashboardGroup" 
  set "dashboardReports" = array_remove("dashboardReports", '${newReportId}') || '{${oldReportId}}'
  where id = '${dashboardGroupId}';

  delete from "dashboardReport" where id  = '${newReportId}';
  `);
};

exports._meta = {
  version: 1,
};
