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
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"matchCriteria": {
      "DP74H": {
        "optionSetCode": "powerhasbeencut(externalcause).powerhasbeencut(loc",
        "valuesToMatch": ["power has been cut (external cause)","power has been cut (local cause)","power is intermittent"]
      },
      "DP74J": {
        "optionSetCode": "wateriscut(externalcause).wateriscut(localcause).w",
        "valuesToMatch": ["water is cut (external cause)","water is cut (local cause)","water supply has been diminished but is running"]
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
    }}'
    WHERE "id" = 'Disaster_Response_Infrastructure_Impact';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
