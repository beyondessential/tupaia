'use strict';

import {
  insertObject,
  deleteObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
  updateValues,
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

const DRILL_DOWN_CODE = 'LESMIS_priority_enrolment_ece_5_target';

const AVERAGE_INDICATOR = {
  id: generateId(),
  code: 'er_priority_district_ece_5_average',
  builder: 'analyticArithmetic',
  config: {
    formula: 'districtCount == 0 ? 0 : rateTotal / districtCount',
    parameters: [
      {
        code: 'rateTotal',
        config: {
          formula: 'er_district_ece_5_t',
          aggregation: [
            {
              type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
              config: {
                dataSourceEntityType: 'sub_district',
                aggregationEntityType: 'requested',
                dataSourceEntityFilter: {
                  attributes_type: 'LESMIS_Target_District',
                },
              },
            },
          ],
        },
        builder: 'analyticArithmetic',
      },
      {
        code: 'districtCount',
        config: {
          formula: 'er_district_ece_5_t',
          aggregation: [
            {
              type: 'COUNT_PER_PERIOD_PER_ORG_GROUP',
              config: {
                dataSourceEntityType: 'sub_district',
                aggregationEntityType: 'requested',
                dataSourceEntityFilter: {
                  attributes_type: 'LESMIS_Target_District',
                },
              },
            },
          ],
        },
        builder: 'analyticArithmetic',
      },
    ],
    aggregation: 'FINAL_EACH_YEAR',
    defaultValues: {
      rateTotal: 0,
      districtCount: 0,
    },
  },
};

const TARGET_INDICATOR = {
  id: generateId(),
  code: 'er_priority_district_ece_5_target',
  builder: 'analyticArithmetic',
  config: {
    formula: '83',
    aggregation: {
      er_priority_district_ece_5_average: 'FINAL_EACH_YEAR',
    },
  },
};

const YEARS = [
  {
    code: 'value1YearAgo',
    offset: 1,
  },
  {
    code: 'value2YearsAgo',
    offset: 2,
  },
  {
    code: 'value3YearsAgo',
    offset: 3,
  },
  {
    code: 'value4YearsAgo',
    offset: 4,
  },
  {
    code: 'value5YearsAgo',
    offset: 5,
  },
];

const SUMMARY_INDICATOR = {
  id: generateId(),
  code: 'er_priority_district_ece_5_summary',
  builder: 'analyticArithmetic',
  config: {
    formula:
      'er_priority_district_ece_5_average >= er_priority_district_ece_5_target ? 1 : er_priority_district_ece_5_average > firstExistingValue(value1YearAgo, value2YearsAgo, value3YearsAgo, value4YearsAgo, value5YearsAgo, Infinity) ? 0 : -1',
    parameters: YEARS.map(year => ({
      code: year.code,
      config: {
        formula: 'er_priority_district_ece_5_average',
        aggregation: [
          'FINAL_EACH_YEAR',
          {
            type: 'OFFSET_PERIOD',
            config: {
              offset: year.offset,
              periodType: 'year',
            },
          },
        ],
      },
      builder: 'analyticArithmetic',
    })),
    aggregation: 'FINAL_EACH_YEAR',
    defaultValues: {
      value1YearAgo: 'undefined',
      value2YearsAgo: 'undefined',
      value3YearsAgo: 'undefined',
      value4YearsAgo: 'undefined',
      value5YearsAgo: 'undefined',
    },
  },
};

const REPORT_CONFIG = {
  fetch: {
    aggregations: [
      {
        type: 'FINAL_EACH_YEAR',
      },
    ],
    dataElements: ['er_priority_district_ece_5_average', 'er_priority_district_ece_5_target'],
  },
  transform: [
    {
      insert: {
        timestamp: '=periodToTimestamp($period)',
        "=translate($dataElement, { er_priority_district_ece_5_average: 'Priority Districts Average', er_priority_district_ece_5_target: 'Priority Districts Target' })":
          '=$value/100',
      },
      exclude: '*',
      transform: 'updateColumns',
    },
    {
      groupBy: 'timestamp',
      transform: 'mergeRows',
    },
  ],
};

const FRONT_END_CONFIG = {
  name:
    'Enrolment rate of 5-year-old children (including children with disabilities) in 40 districts (target line at 83%)',
  type: 'chart',
  xName: 'Year',
  yName: 'Rate (%)',
  chartType: 'line',
  valueType: 'percentage',
  chartConfig: {
    'Priority Districts Target': {
      color: '#4caf50',
    },
    'Priority Districts Average': {
      color: '#9c27b0',
    },
  },
  periodGranularity: 'year',
};

const addIndicators = async db => {
  await insertObject(db, 'indicator', AVERAGE_INDICATOR);
  await insertObject(db, 'indicator', TARGET_INDICATOR);
  await insertObject(db, 'indicator', SUMMARY_INDICATOR);
};

const removeIndicators = async db => {
  await deleteObject(db, 'indicator', { code: AVERAGE_INDICATOR.code });
  await deleteObject(db, 'indicator', { code: TARGET_INDICATOR.code });
  await deleteObject(db, 'indicator', { code: SUMMARY_INDICATOR.code });
};

const EXTRA_LIST_ITEMS = [
  {
    transform: 'updateColumns',
    where: '=and(exists($er_priority_district_ece_5_summary), eq($organisationUnit, "LA"))', // Only display this entry at country level
    insert: {
      code: 'ECEPriorityTarget5',
      label:
        'TARGET: Enrolment rate of 5-year-old children (including children with disabilities) in 40 districts – 2025 target of 83%',
      parent: 'IO1_2',
      statistic: '=$er_priority_district_ece_5_summary',
      sort_order: '5',
    },
    exclude: '*',
  },
  {
    transform: 'insertRows',
    where: '=eq($sort_order, "5")', // If this doesn't have children the statistic formula errors, so use info we know about
    position: 'before',
    columns: {
      code: 'IO1_2',
      label:
        'IO 1.2: Reduced gap in ECE performance between disadvantaged and non-disadvantaged areas (Part I HLO 1, IO 1.5)',
      parent: 'HLO1',
      statistic:
        '=eq(max(where(f($otherRow) = equalText($otherRow.parent ? $otherRow.parent : "", "IO1_2")).statistic), min(where(f($otherRow) = equalText($otherRow.parent ? $otherRow.parent : "", "IO1_2")).statistic)) ? last(where(f($otherRow) = equalText($otherRow.parent ? $otherRow.parent : "", "IO1_2")).statistic) : 0',
      sort_order: '4',
    },
  },
];

const PRE_SORT_FILTER = {
  // Filter out the previous two rows if they weren't processed (i.e. at non-country level)
  transform: 'excludeRows',
  where: '=notExists($sort_order)',
};

const addDrillDownToListVisual = async db => {
  // Add drillDown to dashboard_item config
  const dashboardItem = await findSingleRecord(db, 'dashboard_item', {
    code: 'LESMIS_ESSDP_ECE_HLO1',
  });
  dashboardItem.config.drillDown.itemCodeByEntry = {
    ...dashboardItem.config.drillDown.itemCodeByEntry,
    ECEPriorityTarget5: DRILL_DOWN_CODE,
  };
  await updateValues(
    db,
    'dashboard_item',
    { config: dashboardItem.config },
    { code: 'LESMIS_ESSDP_ECE_HLO1' },
  );
  // Add summary to list report
  const listReport = await findSingleRecord(db, 'report', {
    code: 'LESMIS_ESSDP_ECE_HLO1',
  });
  listReport.config.fetch.dataElements.push('er_priority_district_ece_5_summary');
  listReport.config.transform.splice(1, 0, ...EXTRA_LIST_ITEMS);
  listReport.config.transform.splice(
    listReport.config.transform.findIndex(x => x.transform && x.transform === 'sortRows'),
    0,
    PRE_SORT_FILTER,
  );
  await updateValues(
    db,
    'report',
    { config: listReport.config },
    { code: 'LESMIS_ESSDP_ECE_HLO1' },
  );
};

const removeDrillDownFromListVisual = async db => {
  // Remove drillDown from dashboard_item config
  const dashboardItem = await findSingleRecord(db, 'dashboard_item', {
    code: 'LESMIS_ESSDP_ECE_HLO1',
  });
  const { ECEPriorityTarget5, ...restOfConfig } = dashboardItem.config.drillDown.itemCodeByEntry;
  dashboardItem.config.drillDown.itemCodeByEntry = restOfConfig;
  await updateValues(
    db,
    'dashboard_item',
    { config: dashboardItem.config },
    { code: 'LESMIS_ESSDP_ECE_HLO1' },
  );
  // Remove summary from list report
  const listReport = await findSingleRecord(db, 'report', {
    code: 'LESMIS_ESSDP_ECE_HLO1',
  });
  listReport.config.fetch.dataElements = listReport.config.fetch.dataElements.filter(
    x => x !== 'er_priority_district_ece_5_summary',
  );
  listReport.config.transform = listReport.config.transform.filter(
    x =>
      !(x.insert && x.insert.code === 'ECEPriorityTarget5') &&
      !(x.columns && x.columns.code === 'IO1_2') &&
      !(x.transform && x.transform === 'excludeRows'),
  );
  await updateValues(
    db,
    'report',
    { config: listReport.config },
    { code: 'LESMIS_ESSDP_ECE_HLO1' },
  );
};

// Same util functions as always
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

const dropTrigger = async (db, table) => {
  await db.runSql(`
    DROP TRIGGER IF EXISTS ${table}_trigger
      ON ${table};
  `);
};

const recreateTrigger = async (db, table) => {
  await db.runSql(`
    CREATE TRIGGER ${table}_trigger
      AFTER INSERT OR UPDATE or DELETE
      ON ${table}
      FOR EACH ROW EXECUTE PROCEDURE notification();
  `);
};

exports.up = async function (db) {
  await addIndicators(db);
  await addNewDashboardItemAndReport(db, {
    code: DRILL_DOWN_CODE,
    reportConfig: REPORT_CONFIG,
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LESMIS_ESSDP_EarlyChildhoodSubSector_HLO1',
    entityTypes: ['country'],
    projectCodes: ['laos_schools'],
  });
  // The size of list reports causes errors in the notification
  // so drop trigger while processing
  await dropTrigger(db, 'report');
  await addDrillDownToListVisual(db);
  await recreateTrigger(db, 'report');
};

exports.down = async function (db) {
  await removeIndicators(db);
  await removeDashboardItemAndReport(db, DRILL_DOWN_CODE);
  // The size of list reports causes errors in the notification
  // so drop trigger while processing
  await dropTrigger(db, 'report');
  await removeDrillDownFromListVisual(db);
  await recreateTrigger(db, 'report');
};

exports._meta = {
  version: 1,
};
