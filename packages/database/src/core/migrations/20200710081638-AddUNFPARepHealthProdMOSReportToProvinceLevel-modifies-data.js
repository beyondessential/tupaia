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

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

const dashboardReportOriginalId = 'UNFPA_Reproductive_Health_Product_MOS';
const dashboardReportWithFilterId = 'UNFPA_Reproductive_Health_Product_MOS_National';

const dashboardGroups = [
  'SB_Unfpa_District',
  'WS_Unfpa_District',
  'MH_Unfpa_District',
  'TO_Unfpa_District',
  'FM_Unfpa_District',
  'VU_Unfpa_District',
  'FJ_Unfpa_District',
  'KI_Unfpa_District',
];

exports.up = async function (db) {
  // Rename National Report
  await db.runSql(`
    UPDATE "dashboardReport" SET "id"='${dashboardReportWithFilterId}' WHERE "id"='${dashboardReportOriginalId}';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_replace("dashboardReports", '${dashboardReportOriginalId}', '${dashboardReportWithFilterId}')
    WHERE "dashboardReports" @> '{${dashboardReportOriginalId}}';
  `);

  // create new report without national filter
  await db.runSql(`  
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
      SELECT '${dashboardReportOriginalId}' AS "id", "dataBuilder", 
      "dataBuilderConfig"::jsonb-'filter' AS "dataBuilderConfig", "viewJson", "dataServices"
      FROM "dashboardReport" WHERE "id"='${dashboardReportWithFilterId}';

      
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${dashboardReportOriginalId}}'
    WHERE "code" IN (${arrayToDbString(dashboardGroups)})
    AND "organisationLevel" = 'District';
  `);
};

exports.down = async function (db) {
  await db.runSql(`

  DELETE FROM "dashboardReport" where "id"='${dashboardReportOriginalId}';
  
  UPDATE "dashboardReport" SET "id"='${dashboardReportOriginalId}' WHERE "id"='${dashboardReportWithFilterId}';

  UPDATE "dashboardGroup"
    SET "dashboardReports" = array_replace("dashboardReports", '${dashboardReportWithFilterId}', '${dashboardReportOriginalId}')
    WHERE "dashboardReports" @> '{${dashboardReportWithFilterId}}';

  UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${dashboardReportOriginalId}')
    WHERE "code" IN (${arrayToDbString(dashboardGroups)})
    AND "organisationLevel" = 'District';
  `);
};

exports._meta = {
  version: 1,
};
