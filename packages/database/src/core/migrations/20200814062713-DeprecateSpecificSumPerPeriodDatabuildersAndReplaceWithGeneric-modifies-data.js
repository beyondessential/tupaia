'use strict';

import { arrayToDbString, arrayToDoubleQuotedDbString } from '../utilities';

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

const selectPerDayDashboards = async db =>
  db.runSql(`SELECT * FROM "dashboardReport" WHERE "dataBuilder" = 'sumPerDay';`);

const selectAllPreviousPerDayDashboards = async db =>
  db.runSql(`SELECT * FROM "dashboardReport" WHERE "dataBuilder" = 'sumAllPreviousPerDay';`);

const selectPerWeekDashboards = async db =>
  db.runSql(`SELECT * FROM "dashboardReport" WHERE "dataBuilder" = 'sumPerWeek';`);

const selectPerMonthDashboards = async db =>
  db.runSql(`SELECT * FROM "dashboardReport" WHERE "dataBuilder" = 'sumPerMonth';`);

const compositeDataBuilders = [
  {
    id: 'COVID_Compose_Cumulative_Deaths_Vs_Cases',
    paths: [['cases'], ['deaths']],
    aggregationType: 'SUM_PREVIOUS_EACH_DAY',
  },
  {
    id: 'COVID_Compose_Daily_Deaths_Vs_Cases',
    paths: [['cases'], ['deaths']],
    aggregationType: 'FINAL_EACH_DAY',
  },
  {
    id: 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations',
    paths: [['mrdtPositive'], ['consultations']],
    aggregationType: 'FINAL_EACH_WEEK',
  },
  {
    id: 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations',
    paths: [
      ['positive', 'dataBuilderConfig', 'dataBuilders', 'positiveCount'],
      ['positive', 'dataBuilderConfig', 'dataBuilders', 'consultationCount'],
      ['consultations'],
    ],
    aggregationType: 'FINAL_EACH_WEEK',
  },
  {
    id: 'PG_Strive_PNG_RDT_Tests_Total_And_Percent_Positive',
    paths: [
      ['mRDT Total'],
      ['mRDT Positive Percentage', 'dataBuilderConfig', 'dataBuilders', 'positiveCount'],
      ['mRDT Positive Percentage', 'dataBuilderConfig', 'dataBuilders', 'consultationCount'],
    ],
    aggregationType: 'FINAL_EACH_WEEK',
  },
];

exports.up = async function (db) {
  const perDayDashboardIds = (await selectPerDayDashboards(db)).rows.map(row => row.id);
  const perAllPreviousDayDashboardIds = (await selectAllPreviousPerDayDashboards(db)).rows.map(
    row => row.id,
  );
  const perWeekDashboardIds = (await selectPerWeekDashboards(db)).rows.map(row => row.id);
  const perMonthDashboardIds = (await selectPerMonthDashboards(db)).rows.map(row => row.id);

  const allDashboardIds = [
    ...perDayDashboardIds,
    ...perAllPreviousDayDashboardIds,
    ...perWeekDashboardIds,
    ...perMonthDashboardIds,
  ];

  if (allDashboardIds.length) {
    await db.runSql(`
      UPDATE "dashboardReport"
      SET "dataBuilder" = 'sumPerPeriod'
      WHERE id IN (${arrayToDbString(allDashboardIds)});
  `);
  }

  if (perDayDashboardIds.length) {
    await db.runSql(`
      UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig" || '{ "aggregationType": "FINAL_EACH_DAY" }'
      WHERE id IN (${arrayToDbString(perDayDashboardIds)});
  `);
  }

  if (perAllPreviousDayDashboardIds.length) {
    await db.runSql(`
      UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig" || '{ "aggregationType": "SUM_PREVIOUS_EACH_DAY" }'
      WHERE id IN (${arrayToDbString(perAllPreviousDayDashboardIds)});
  `);
  }

  if (perWeekDashboardIds.length) {
    await db.runSql(`
      UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig" || '{ "aggregationType": "FINAL_EACH_WEEK" }'
      WHERE id IN (${arrayToDbString(perWeekDashboardIds)});
  `);
  }

  if (perMonthDashboardIds.length) {
    await db.runSql(`
      UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig" || '{ "aggregationType": "FINAL_EACH_MONTH" }'
      WHERE id IN (${arrayToDbString(perMonthDashboardIds)});
  `);
  }

  await Promise.all(
    compositeDataBuilders.map(async compositeDataBuilder => {
      await Promise.all(
        compositeDataBuilder.paths.map(async path => {
          await db.runSql(`
            UPDATE "dashboardReport"
            SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{"dataBuilders", ${arrayToDoubleQuotedDbString(
              path,
            )}, "dataBuilder"}', '"sumPerPeriod"')
            WHERE id = '${compositeDataBuilder.id}';
        `);

          await db.runSql(`
            UPDATE "dashboardReport"
            SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{"dataBuilders", ${arrayToDoubleQuotedDbString(
              path,
            )}, "dataBuilderConfig", "aggregationType"}', '"${
            compositeDataBuilder.aggregationType
          }"')
            WHERE id = '${compositeDataBuilder.id}';
        `);
        }),
      );
    }),
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
