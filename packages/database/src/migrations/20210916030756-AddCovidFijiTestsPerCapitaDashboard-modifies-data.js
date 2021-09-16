Skip to content
Search or jump to…
Pull requests
Issues
Marketplace
Explore

@Alastair-L
beyondessential
  /
  tupaia
Public
3
4
3
Code
Pull requests
23
Actions
ZenHub
Projects
Wiki
Security
7
Insights
Phx 23 7 day positivity dashboard #3209
Open
Alastair - L wants to merge 6 commits into dev from phx - 23 - 7 - day - positivity - dashboard
  + 287 −0 
 Conversation 6
 Commits 6
 Checks 0
 Files changed 2
Open
Phx 23 7 day positivity dashboard
#3209
File filter
0 / 2 files viewed
122  ...tabase / src / migrations / 20210818014247 - AddFijiCovid7DayPositivityIndicator - modifies - data.js
Viewed
@@ -0, 0 + 1, 122 @@
'use strict';

import {
  insertObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
  deleteObject,
} from '../utilities';

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

const INDICATOR_1 = {
  code: 'COVID_FJ_7_Day_Rolling_Pos_Tests',
  builder: 'analyticArithmetic',
  config: {
    formula: new Array(7)
      .fill(0)
      .map((_, i) => `PositiveTests${i + 1}Day${i === 0 ? '' : 's'}Ago`)
      .join(' + '),
    parameters: new Array(7).fill(0).map((_, i) => ({
      // Note: from 0 to 6 days ago
      code: `PositiveTests${i + 1}Day${i === 0 ? '' : 's'}Ago`,
      config: {
        formula: 'COVIDTest_FJPosTest',
        aggregation: [
          'FINAL_EACH_DAY',
          {
            type: 'OFFSET_PERIOD',
            config: {
              offset: i + 1,
              periodType: 'day',
            },
          },
        ],
      },
      builder: 'analyticArithmetic',
    })),
    aggregation: 'FINAL_EACH_DAY',
    defaultValues: new Array(7)
      .fill(0)
      .map((_, i) => `PositiveTests${i + 1}Day${i === 0 ? '' : 's'}Ago`)
      .reduce((acc, code) => ({ ...acc, [code]: 0 }), {}),
  },
};

const INDICATOR_2 = {
  code: 'COVID_FJ_7_Day_Rolling_Num_Tests',
  builder: 'analyticArithmetic',
  config: {
    formula: new Array(7)
      .fill(0)
      .map((_, i) => `NumTests${i + 1}Day${i === 0 ? '' : 's'}Ago`)
      .join(' + '),
    parameters: new Array(7).fill(0).map((_, i) => ({
      // Note: from 0 to 6 days ago
      code: `NumTests${i + 1}Day${i === 0 ? '' : 's'}Ago`,
      config: {
        formula: 'COVIDTest_FJNumTest',
        aggregation: [
          'FINAL_EACH_DAY',
          {
            type: 'OFFSET_PERIOD',
            config: {
              offset: i + 1,
              periodType: 'day',
            },
          },
        ],
      },
      builder: 'analyticArithmetic',
    })),
    aggregation: 'FINAL_EACH_DAY',
    defaultValues: new Array(7)
      .fill(0)
      .map((_, i) => `NumTests${i + 1}Day${i === 0 ? '' : 's'}Ago`)
      .reduce((acc, code) => ({ ...acc, [code]: 0 }), {}),
  },
};

exports.up = async function (db) {
  // const indicator = generateIndicator();
  await insertObject(db, 'indicator', { ...INDICATOR_1, id: generateId() });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: INDICATOR_1.code,
    type: 'dataElement',
    service_type: 'indicator',
  });

  await insertObject(db, 'indicator', { ...INDICATOR_2, id: generateId() });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: INDICATOR_2.code,
    type: 'dataElement',
    service_type: 'indicator',
  });
};

exports.down = async function (db) {
  await deleteObject(db, 'indicator', { code: INDICATOR_1.code });
  await deleteObject(db, 'data_source', { code: INDICATOR_1.code });

  await deleteObject(db, 'indicator', { code: INDICATOR_2.code });
  await deleteObject(db, 'data_source', { code: INDICATOR_2.code });
};

exports._meta = {
  version: 1,
};
165  ...abase / src / migrations / 20210913030808 - AddCovidFiji7DayPositivityRateReport - modifies - data.js
Viewed
@@ -0, 0 + 1, 165 @@
'use strict';

import {
  insertObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
  deleteObject,
} from '../utilities';

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

const INDICATORS = [
  {
    code: 'alastair_fiji_covid_tests_per_sub_district',
    builder: 'analyticArithmetic',
    config:
    {
      "formula": "BCD46", "aggregation":
        { "BCD46": { "type": "SUM_PER_PERIOD_PER_ORG_GROUP", "config": { "dataSourceEntityType": "facility", "aggregationEntityType": "sub_district" } } }
    }
  },
  {
    code: 'alastair_fiji_population_per_day',
    builder: 'analyticArithmetic',
    config: { "formula": "population_FJ001", "aggregation": { "population_FJ001": "SUM_PREVIOUS_EACH_DAY" } }
  },
];

const generateConfig = () => ({
  code: `FJ_Covid_7_Day_Positivity_Rate`,
  reportConfig: {
    fetch: {
      "dataElements": [
        "alastair_fiji_covid_tests_per_sub_district",
        "alastair_fiji_population_per_day"
      ],
      "aggregations": [
        {
          "type": "RAW",
          "config": {
            "dataSourceEntityType": "sub_district",
            "aggregationEntityType": "requested"
          }
        }
      ],
    },
    "transform": [
      "keyValueByDataElementName",
      {
        "transform": "mergeRows",
        "groupBy": "period",
        "using": {
          "alastair_fiji_covid_tests_per_sub_district": "sum",
          "alastair_fiji_population_per_day": "sum",
          "organisationUnit": "exclude"
        }
      },
      {
        "transform": "updateColumns",
        "insert": {
          "Tests": "=$alastair_fiji_covid_tests_per_sub_district",
          "Population": "=subset(@all.alastair_fiji_population_per_day, index(1))"
        },
        "description": "subset(@all.alastair_fiji_population_per_day, index(1)), just takes the first population response (they should all be the same)",
        "include": [
          "period"
        ]
      },
      {
        "transform": "excludeRows",
        "where": "=not exists($Tests)"
      },
      {
        "transform": "updateColumns",
        "insert": {
          "Tests per 100k": "=$Tests / ($Population / 100000)",
          "name": "=periodToDisplayString($period, 'DAY')",
          "timestamp": "=periodToTimestamp($period)'"
        },
        include: [
          "period"
        ]
      }
    ],
  },
  frontEndConfig: {
    "name": "COVID-19 Total tests per capita",
    "type": "chart",
    "chartType": "bar",
    "valueType": "number",
    "chartConfig": {
      "Tests per 100k": {
        "label": "Tests per 100k"
      }
    },
    "periodGranularity": "day",
    "presentationOptions": {
      "hideAverage": "true"
    }
  },
});

const addNewDashboardItemAndReport = async (
  db,
  { code, frontEndConfig, reportConfig, permissionGroup, dashboardCode, entityTypes, projectCodes },
) => {
  // insert report
  const reportId = generateId();
  const permissionGroupId = (
    await findSingleRecord(db, 'permission_group', { name: permissionGroup })
  ).id;
  await insertObject(db, 'report', {
    id: reportId,
    code,
    config: reportConfig,
    permission_group_id: permissionGroupId,
  });

  // insert dashboard item
  const dashboardItemId = generateId();
  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code,
    config: frontEndConfig,
    report_code: code,
  });

  // insert relation record connecting dashboard item to dashboard

  await addItemToDashboard(db, { code, dashboardCode, entityTypes, projectCodes, permissionGroup });
};

const addItemToDashboard = async (
  db,
  { code, dashboardCode, permissionGroup, entityTypes, projectCodes },
) => {
  const dashboardItemId = (await findSingleRecord(db, 'dashboard_item', { code })).id;
  const dashboardId = (await findSingleRecord(db, 'dashboard', { code: dashboardCode })).id;
  const maxSortOrder = (
    await findSingleRecordBySql(
      db,
      `SELECT max(sort_order) as max_sort_order FROM dashboard_relation WHERE dashboard_id = '${dashboardId}';`,
    )
  ).max_sort_order;
  await insertObject(db, 'dashboard_relation', {
    id: generateId(),
    dashboard_id: dashboardId,
    child_id: dashboardItemId,
    entity_types: `{${entityTypes.join(', ')}}`,
    project_codes: `{${projectCodes.join(', ')}}`,
    permission_groups: `{${permissionGroup}}`,
    sort_order: maxSortOrder + 1,
  });
};

const removeDashboardItemAndReport = async (db, code) => {
  await db.runSql(`DELETE FROM dashboard_item WHERE code = '${code}';`); // delete cascades to dashboard_relation
  await db.runSql(`DELETE FROM report WHERE code = '${code}';`);
};

exports.up = async function (db) {
  for (indicator of INDICATORS) {
    await insertObject(db, 'indicator', { ...indicator, id: generateId() });
    await insertObject(db, 'data_source', {
      id: generateId(),
      code: indicator.code,
      type: 'dataElement',
      service_type: 'indicator',
    });
  }

  const { code, reportConfig, frontEndConfig } = generateConfig();
  await addNewDashboardItemAndReport(db, {
    code,
    reportConfig,
    frontEndConfig,
    permissionGroup: 'BES Admin',
    dashboardCode: 'FJ_COVID-19_Fiji',
    entityTypes: ['sub_district', 'district', 'country'],
    projectCodes: ['supplychain_fiji'],
  });
};

exports.down = async function (db) {
  const { code } = generateConfig();
  await removeDashboardItemAndReport(db, code);

  for (indicator of INDICATORS) {
    await deleteObject(db, 'indicator', { code: indicator.code });
    await deleteObject(db, 'data_source', { code: indicator.code });
  }
};

exports._meta = {
  version: 1,
};