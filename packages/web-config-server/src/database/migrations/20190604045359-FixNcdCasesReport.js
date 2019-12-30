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
  // First copy the wrongly named field to a correct field,
  // and then delete the wrong field
  return db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = jsonb_set
          (
            "dataBuilderConfig",
            '{series, Males, dataClasses, Chronic Obstructive Airway Disease}',
            "dataBuilderConfig"::jsonb#>'{series, Males, dataClasses, Chronic Obstructive AirwayDisease}',
            true
          )
    WHERE
      id = 'TO_CH_NCD_Cases'; 

    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig"::jsonb
        #- '{series, Males, dataClasses, Chronic Obstructive AirwayDisease}'
    WHERE
      id = 'TO_CH_NCD_Cases'; 
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
