'use strict';

import { insertObject, generateId } from '../utilities';

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
async function addReportToGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{"${reportId}"}'
    WHERE
      "code" IN (${groupCodes.map(code => `'${code}'`).join(',')});
  `);
}
async function removeReportFromGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${reportId}')
    WHERE
      "code" IN (${groupCodes.map(code => `'${code}'`).join(',')});
  `);
}
async function deleteItemByOneCondition(db, table, condition) {
  const [key, value] = Object.entries(condition)[0];
  return db.runSql(`
    DELETE FROM
      "${table}"
    WHERE
      "${key}" = '${value}';
  `);
}
const totalClientNumberIndicator = {
  id: generateId(),
  code: 'TO_HPU_Nutrition_Counselling_Number_Of_Total_Clients',
  builder: 'arithmetic',
  config: {
    formula:
      'HP299b + HP299c + HP300a + HP300b + HP301a + HP301b + HP302a_m + HP302a_f +HP302b_m + HP302b_f + HP303 + HP304 + HP323aa + HP323ab + HP324a + HP324b + HP325a + HP325b + HP326a_m + HP326a_f + HP326b_m + HP326b_f + HP327 + HP328',
    aggregation: 'SUM_EACH_MONTH',
    defaultValues: {
      HP299b: 0,
      HP299c: 0,
      HP300a: 0,
      HP300b: 0,
      HP301a: 0,
      HP301b: 0,
      HP302a_m: 0,
      HP302a_f: 0,
      HP302b_m: 0,
      HP302b_f: 0,
      HP303: 0,
      HP304: 0,
      HP323aa: 0,
      HP323ab: 0,
      HP324a: 0,
      HP324b: 0,
      HP325a: 0,
      HP325b: 0,
      HP326a_m: 0,
      HP326a_f: 0,
      HP326b_m: 0,
      HP326b_f: 0,
      HP327: 0,
      HP328: 0,
    },
  },
};
const newClientNumberIndicator = {
  id: generateId(),
  code: 'TO_HPU_Nutrition_Counselling_Number_Of_New_Clients',
  builder: 'arithmetic',
  config: {
    formula:
      'HP305a + HP305b + HP306a + HP306b + HP307b + HP307a + HP308a_m + HP308a_f + HP308b_m + HP308b_f + HP309 + HP310 + HP329a + HP329b + HP330a + HP330b + HP331a + HP331b + HP332a_m + HP332a_f + HP332b_m + HP332b_f + HP333 + HP334',
    aggregation: 'SUM_EACH_MONTH',
    defaultValues: {
      HP305a: 0,
      HP305b: 0,
      HP306a: 0,
      HP306b: 0,
      HP307a: 0,
      HP307b: 0,
      HP308a_m: 0,
      HP308a_f: 0,
      HP308b_m: 0,
      HP308b_f: 0,
      HP309: 0,
      HP310: 0,
      HP329a: 0,
      HP329b: 0,
      HP330a: 0,
      HP330b: 0,
      HP331a: 0,
      HP331b: 0,
      HP332a_m: 0,
      HP332a_f: 0,
      HP332b_m: 0,
      HP332b_f: 0,
      HP333: 0,
      HP334: 0,
    },
  },
};
const completedClientNumberIndicator = {
  id: generateId(),
  code: 'TO_HPU_Nutrition_Counselling_Number_Of_Completed_Clients',
  builder: 'arithmetic',
  config: {
    formula:
      'HP311a + HP311b + HP312a + HP312b + HP313a + HP313b + HP314a_m + HP314a_f + HP314b_m + HP314b_f + HP315 + HP316 + HP335a + HP335b + HP336a + HP336b + HP337a  + HP337b + HP338a_m + HP338a_f + HP338b_m + HP338b_f + HP339 + HP340',
    aggregation: 'SUM_EACH_MONTH',
    defaultValues: {
      HP311a: 0,
      HP311b: 0,
      HP312a: 0,
      HP312b: 0,
      HP313a: 0,
      HP313b: 0,
      HP314a_m: 0,
      HP314a_f: 0,
      HP314b_m: 0,
      HP314b_f: 0,
      HP315: 0,
      HP316: 0,
      HP335a: 0,
      HP335b: 0,
      HP336a: 0,
      HP336b: 0,
      HP337a: 0,
      HP337b: 0,
      HP338a_m: 0,
      HP338a_f: 0,
      HP338b_m: 0,
      HP338b_f: 0,
      HP339: 0,
      HP340: 0,
    },
  },
};
const dropOutClientNumberIndicator = {
  id: generateId(),
  code: 'TO_HPU_Nutrition_Counselling_Number_Of_Drop_Out_Clients',
  builder: 'arithmetic',
  config: {
    formula:
      'HP317a + HP317b + HP318a + HP318b + HP319a + HP319b + HP320a_m + HP320a_f + HP320b_m + HP320b_f + HP321 + HP322 + HP341a + HP341b + HP342a + HP342b + HP343a  + HP343b + HP344a_m + HP344a_f + HP344b_m + HP344b_f + HP345 + HP346',
    aggregation: 'SUM_EACH_MONTH',
    defaultValues: {
      HP317a: 0,
      HP317b: 0,
      HP318a: 0,
      HP318b: 0,
      HP319a: 0,
      HP319b: 0,
      HP320a_m: 0,
      HP320a_f: 0,
      HP320b_m: 0,
      HP320b_f: 0,
      HP321: 0,
      HP322: 0,
      HP341a: 0,
      HP341b: 0,
      HP342a: 0,
      HP342b: 0,
      HP343a: 0,
      HP343b: 0,
      HP344a_m: 0,
      HP344a_f: 0,
      HP344b_m: 0,
      HP344b_f: 0,
      HP345: 0,
      HP346: 0,
    },
  },
};
const dashboardReport = {
  id: 'TO_HPU_Nutrition_Counselling_Total_Clients',
  dataBuilder: 'analyticsPerPeriod',
  dataBuilderConfig: {
    periodType: 'month',
    series: [
      {
        key: 'Total',
        dataElementCode: totalClientNumberIndicator.code,
      },
      {
        key: 'New',
        dataElementCode: newClientNumberIndicator.code,
      },
      {
        key: 'Completed',
        dataElementCode: completedClientNumberIndicator.code,
      },
      {
        key: 'Drop out',
        dataElementCode: dropOutClientNumberIndicator.code,
      },
    ],
    aggregationType: 'SUM_EACH_MONTH',
  },
  viewJson: {
    name: 'Nutrition counselling: Total clients',
    type: 'chart',
    chartType: 'bar',
    chartConfig: {
      Total: {
        stackId: 1,
        legendOrder: 1,
      },
      New: {
        stackId: 2,
        legendOrder: 2,
      },
      Completed: {
        stackId: 3,
        legendOrder: 3,
      },
      'Drop out': {
        stackId: 4,
        legendOrder: 4,
      },
    },
    defaultTimePeriod: {
      unit: 'year',
    },
    periodGranularity: 'one_year_at_a_time',
  },
  dataServices: [
    {
      isDataRegional: false,
    },
  ],
};
const dashboardGroupCode = 'TO_Health_Promotion_Unit_Country';

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', dashboardReport);
  await addReportToGroups(db, dashboardReport.id, [dashboardGroupCode]);
  for (const indicator of [
    totalClientNumberIndicator,
    newClientNumberIndicator,
    completedClientNumberIndicator,
    dropOutClientNumberIndicator,
  ]) {
    await insertObject(db, 'indicator', indicator);
    await insertObject(db, 'data_source', {
      id: generateId(),
      code: indicator.code,
      type: 'dataElement',
      service_type: 'indicator',
    });
  }
};

exports.down = async function (db) {
  await deleteItemByOneCondition(db, 'dashboardReport', { id: dashboardReport.id });
  await removeReportFromGroups(db, dashboardReport.id, [dashboardGroupCode]);
  for (const indicator of [
    totalClientNumberIndicator,
    newClientNumberIndicator,
    completedClientNumberIndicator,
    dropOutClientNumberIndicator,
  ]) {
    await deleteItemByOneCondition(db, 'indicator', { code: indicator.code });
    await deleteItemByOneCondition(db, 'data_source', { code: indicator.code });
  }
};

exports._meta = {
  version: 1,
};
