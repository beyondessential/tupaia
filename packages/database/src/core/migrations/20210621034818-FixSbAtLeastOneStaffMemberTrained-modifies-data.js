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

const dashboardItems = [
  'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_SB',
  'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_VU',
];

exports.up = async function (db) {
  for (const dashboardItemCode of dashboardItems) {
    await db.runSql(`
      update "legacy_report" dr
      set "data_builder_config" = regexp_replace(dr."data_builder_config"::text, 'RHS1UNFPA03','RHS4UNFPA807','g')::jsonb
      where code = '${dashboardItemCode}'
  `);
  }
};

exports.down = async function (db) {
  for (const dashboardItemCode of dashboardItems) {
    await db.runSql(`
      update "legacy_report" dr
      set "data_builder_config" = regexp_replace(dr."data_builder_config"::text, 'RHS4UNFPA807','RHS1UNFPA03','g')::jsonb
      where code = '${dashboardItemCode}'
    `);
  }
};

exports._meta = {
  version: 1,
};
