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
    UPDATE "dashboardReport"
    SET
      "dataBuilder" = 'countMatchingDataValuesOverTotal',
      "dataBuilderConfig" = '{
        "dataElementCodes": ["DP74H", "DP74J", "DP17", "DP18", "DP67", "DP71", "DP74A"],
        "matchCriteria": {
          "DP74H": {
            "optionSetCode": "powerhasbeencut(externalcause).powerhasbeencut(loc",
            "valuesToMatch": ["power available", "facility never had electricity"]
          },
          "DP74J": {
            "optionSetCode": "wateriscut(externalcause).wateriscut(localcause).w",
            "valuesToMatch": ["water supply is uninterrupted", "facility never had water supply"]
          },
          "DP17": {
            "valuesToMatch": [1]
          },
          "DP18": {
            "valuesToMatch": [1]
          },
          "DP67": {
            "valuesToMatch": [1]
          },
          "DP71": {
            "valuesToMatch": [1]
          },
          "DP74A": {
            "valuesToMatch": [1]
          }
        }
      }'
    WHERE "id" = 'Disaster_Response_Infrastructure_Impact';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET
      "dataBuilder" = 'dataElementsOverTotalOperational',
      "dataBuilderConfig" = '{"dataElementCodes": ["DP74H", "DP74J", "DP17", "DP18", "DP67", "DP71", "DP74A"]}'
    WHERE "id" = 'Disaster_Response_Infrastructure_Impact';
  `);
};

exports._meta = {
  version: 1,
};
