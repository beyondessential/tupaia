'use strict';

var dbm;
var type;
var seed;

const NEW_FILTER_CONFIG = {
  value: "{serviceStatus}"
};

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
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig" - 'measureCriteria'
    WHERE
      "id" = '39'
    AND 
      "drillDownLevel" = '1';

    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig" || '{"filter": ${JSON.stringify(NEW_FILTER_CONFIG)}}'
    WHERE
      "id" = '39'
    AND 
      "drillDownLevel" = '1';
  `);
};

exports.down = async function(db) {
  await db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig" - 'filter'
    WHERE
      "id" = '39'
    AND 
      "drillDownLevel" = '1';

    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig" || '{"measureCriteria": { "EQ": "{serviceStatus}" }}'
    WHERE
      "id" = '39'
    AND 
      "drillDownLevel" = '1';
  `);
};

exports._meta = {
  "version": 1
};
