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
    SET id = 'Disaster_Response_Comparisons',
        "dataBuilder" = 'compareDataElementPairs',
        "dataBuilderConfig" = '{"dataElementPairs": [["DP9", "DP_NEW003"]]}',
        "viewJson" = '{"name": "Disaster Response Normal vs Current", "type": "view", "viewType": "multiValueRow", "presentationOptions": {"rowHeader": {"name": "Indicators", "color": "#efeff0"}, "dataPairNames": ["Inpatient beds"], "leftColumn": {"color": "#22c7fc", "header": "Normal"}, "rightColumn": {"color": "#db2222", "header": "Current"}}}'
    WHERE id = 'disaster_response_basic_indicators';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = '{"8","31","9","30","35","34","32","Disaster_Response_Comparisons"}'
    WHERE name = 'Disaster Response' AND "organisationLevel" = 'Facility';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
