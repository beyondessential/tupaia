'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const REPORT_IDS = [
  'COVID_Total_Cases_By_Type',
  'COVID_Total_Cases_By_State',
  'COVID_New_Cases_By_Day',
  'COVID_New_Cases_By_State',
  'COVID_Daily_Cases_By_Type',
];
/* Example:
 * ```
 * {
 * "dateConfig": {
 *   "dataElementCode": "dailysurvey003"
 * },
 * "dataBuilders": {
 *   "data": {
 *     "dataBuilder": "<OLD_DATA_BUILDER>",
 *     "dataBuilderConfig": "<OLD_DATA_BUILDER_CONFIG>"
 *   }
 * }
 *}
 */

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db
    .runSql(
      `
    select * from "dashboardReport"
    where "id" in (${arrayToDbString(REPORT_IDS)});
  `,
    )
    .then(prev => {
      const allData = prev.rows;
      return Promise.all(
        allData.map(report => {
          const { id, dataBuilder, dataBuilderConfig } = report;
          return db.runSql(`
          update "dashboardReport"
          set "dataBuilder" = 'composeWithLastUpdated',
            "dataBuilderConfig" = '{
              "dateConfig": {
                "dataElementCode": "dailysurvey003"
              },
              "dataBuilders": {
                "data": {
                  "dataBuilder": "${dataBuilder}",
                  "dataBuilderConfig": ${JSON.stringify(dataBuilderConfig)}
                }
              }
            }'
          where "id" = '${id}';
          `);
        }),
      );
    });
};

exports.down = function(db) {
  return db
    .runSql(
      `
    select * from "dashboardReport"
    where "id" in (${arrayToDbString(REPORT_IDS)});
  `,
    )
    .then(prev => {
      const allData = prev.rows;
      return Promise.all(
        allData.map(report => {
          const { id } = report;
          const { dataBuilder, dataBuilderConfig } = report.dataBuilderConfig.dataBuilders.data;
          return db.runSql(`
          update "dashboardReport"
          set "dataBuilder" = '${dataBuilder}',
            "dataBuilderConfig" = '${JSON.stringify(dataBuilderConfig)}'
          where "id" = '${id}';
          `);
        }),
      );
    });
};

exports._meta = {
  version: 1,
};
