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

const dashboardId = 'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_SB';

exports.up = async function (db) {
  await db.runSql(`
  update "dashboardReport" dr
  set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, 'RHS1UNFPA03','RHS4UNFPA809','g')::jsonb
  where id = '${dashboardId}'
`);
};

exports.down = async function (db) {
  await db.runSql(`
  update "dashboardReport" dr
  set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, 'RHS4UNFPA809','RHS1UNFPA03','g')::jsonb
  where id = '${dashboardId}'
`);
};

exports._meta = {
  version: 1,
};
