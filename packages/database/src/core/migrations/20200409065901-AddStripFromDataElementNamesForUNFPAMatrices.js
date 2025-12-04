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

exports.up = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = "dataBuilderConfig" || '{"stripFromDataElementNames": "Average Monthly Consumption"}'
    where id = 'UNFPA_Priority_Medicines_AMC';
    
    update "dashboardReport"
    set "dataBuilderConfig" = "dataBuilderConfig" || '{"stripFromDataElementNames": "Stock on Hand"}'
    where id = 'UNFPA_Priority_Medicines_SOH';
    
    update "dashboardReport"
    set "dataBuilderConfig" = "dataBuilderConfig" || '{"stripFromDataElementNames": "Months of Stock"}'
    where id = 'UNFPA_Priority_Medicines_MOS';
  `);
};

exports.down = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = "dataBuilderConfig" - 'stripFromDataElementNames'
  where id = 'UNFPA_Priority_Medicines_AMC';
  
  update "dashboardReport"
  set "dataBuilderConfig" = "dataBuilderConfig" - 'stripFromDataElementNames'
  where id = 'UNFPA_Priority_Medicines_SOH';
  
  update "dashboardReport"
  set "dataBuilderConfig" = "dataBuilderConfig" - 'stripFromDataElementNames'
  where id = 'UNFPA_Priority_Medicines_MOS';
  `);
};

exports._meta = {
  version: 1,
};
