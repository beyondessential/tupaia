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

const dashboardId = 'UNFPA_RH_Stock_Cards_Use_Matrix';

exports.up = async function (db) {
  await db.runSql(`
      update "dashboardReport" dr
      set "viewJson" = regexp_replace(dr."viewJson"::text, '\\"presentationOptions\\"\\: \\{','"presentationOptions" : {"type":"condition",','g')::jsonb
      where id = '${dashboardId}';

      update "dashboardReport" dr
      set "viewJson" = regexp_replace(dr."viewJson"::text, '\\"key\\"\\: 0','"condition": "No"','g')::jsonb
      where id = '${dashboardId}';

      update "dashboardReport" dr
      set "viewJson" = regexp_replace(dr."viewJson"::text, '\\"key\\"\\: 1','"condition": "Yes"','g')::jsonb
      where id = '${dashboardId}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
      update "dashboardReport" dr
      set "viewJson" = regexp_replace(dr."viewJson"::text, '\\"type\\"\\: \\"condition\\"\\,','','g')::jsonb
      where id = '${dashboardId}';

      update "dashboardReport" dr
      set "viewJson" = regexp_replace(dr."viewJson"::text, '\\"condition\\"\\: \\"No\\"','"key" : 0','g')::jsonb
      where id = '${dashboardId}';

      update "dashboardReport" dr
      set "viewJson" = regexp_replace(dr."viewJson"::text, '\\"condition\\"\\: \\"Yes\\"','"key" : 1','g')::jsonb
      where id = '${dashboardId}';
  `);
};

exports._meta = {
  version: 1,
};
