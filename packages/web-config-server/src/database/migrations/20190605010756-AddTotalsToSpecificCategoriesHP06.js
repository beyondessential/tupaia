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

`
"HP06_Section_1_Total_Restricted_Areas_Inspected": { "shouldShowTotals": false },
"HP06_Section_2_Number_of_Areas_Non_Compliant": { "shouldShowTotals": true },
"HP06_Section_3_Spot_Warning": { "shouldShowTotals": true },
"HP06_Section_4_Spot_Fine": { "shouldShowTotals": true },
"HP06_Section_5_Miscellaneous: { "shouldShowTotals": false }
`;

exports.up = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig"
        - 'shouldShowTotalsRow'
        || '{
            "rowCategories": {
              "HP06_Section_1_Total_Restricted_Areas_Inspected": { "shouldShowTotals": false },
              "HP06_Section_2_Number_of_Areas_Non_Compliant": { "shouldShowTotals": true },
              "HP06_Section_3_Spot_Warning": { "shouldShowTotals": true },
              "HP06_Section_4_Spot_Fine": { "shouldShowTotals": true },
              "HP06_Section_5_Miscellaneous": { "shouldShowTotals": false }
            }
          }'
        || '{ "stripFromRowCategoryNames": "HP06 Section - " }'
      WHERE "id" = 'TO_HPU_Validation_HP_06' AND "drillDownLevel" IS NULL;
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig"
        || '{ "shouldShowTotalsRow": true }'
        - 'rowCategories'
        - 'stripFromRowCategoryNames'
      WHERE "id" = 'TO_HPU_Validation_HP_06' AND "drillDownLevel" IS NULL;
  `);
};

exports._meta = {
  version: 1,
};
