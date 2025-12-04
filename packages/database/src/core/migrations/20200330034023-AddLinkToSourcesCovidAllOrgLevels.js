'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const REPORT_ID = 'COVID_Link_To_Sources';

const DASHBOARD_GROUP_CODES = ['AU_Covid_Country', 'AU_Covid_Province', 'AU_Covid_Facility'];

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
  INSERT INTO "dashboardReport" (
    "id",
    "dataBuilder",
    "dataBuilderConfig",
    "viewJson"
    )
  VALUES (
    '${REPORT_ID}',
    'externalLink',
    '{
      "url": "https://beyondessential.com.au/covid-19-data-assumptions/"
    }',
    '{  
      "name": "Data sources and assumptions",
      "type": "view",
      "viewType": "singleDownloadLink"
    }'
    );

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_ID} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});

  `);
};

exports.down = function (db) {
  return db.runSql(`
  delete from "dashboardReport"
  where "id" = '${REPORT_ID}';

  UPDATE
    "dashboardGroup"
  SET
  "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
  WHERE
    "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
