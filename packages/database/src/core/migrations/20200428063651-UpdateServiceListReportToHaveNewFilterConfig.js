'use strict';

var dbm;
var type;
var seed;

// New Filter Config with 'filter' key and operator '=', '>' instead of 'EQ', 'GT'
const NEW_FILTER_CONFIG = {
  value: '{serviceStatus}',
};

// Old Filter Config with 'measureCriteria' key and operator 'EQ', 'GT'
const OLD_FILTER_CONFIG = {
  EQ: '{serviceStatus}',
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
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
      "dataBuilderConfig" = "dataBuilderConfig" || '{"filter": ${JSON.stringify(
        NEW_FILTER_CONFIG,
      )}}'
    WHERE
      "id" = '39'
    AND 
      "drillDownLevel" = '1';
  `);
};

exports.down = async function (db) {
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
      "dataBuilderConfig" = "dataBuilderConfig" || '{"measureCriteria": ${JSON.stringify(
        OLD_FILTER_CONFIG,
      )}}'
    WHERE
      "id" = '39'
    AND 
      "drillDownLevel" = '1';
  `);
};

exports._meta = {
  version: 1,
};
