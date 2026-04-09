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

const generateAverageIndicator = (code, dataElement, attributeFilter) => ({
  id: generateId(),
  code,
  builder: 'analyticArithmetic',
  config: {
    aggregation: 'FINAL_EACH_YEAR',
    formula: `count == 0 ? 0 : sum / count`,
    parameters: [
      {
        builder: 'analyticArithmetic',
        code: 'sum',
        config: {
          formula: `${dataElement}`,
          aggregation: [
            {
              type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
              config: {
                aggregationEntityType: 'requested',
                dataSourceEntityType: 'sub_district',
                dataSourceEntityFilter: {
                  attributes_type: `${attributeFilter}`,
                },
              },
            },
          ],
        },
      },
      {
        builder: 'analyticArithmetic',
        code: 'count',
        config: {
          formula: `${dataElement}`,
          aggregation: [
            {
              type: 'COUNT_PER_PERIOD_PER_ORG_GROUP',
              config: {
                aggregationEntityType: 'requested',
                dataSourceEntityType: 'sub_district',
                dataSourceEntityFilter: {
                  attributes_type: `${attributeFilter}`,
                },
              },
            },
          ],
        },
      },
    ],
    defaultValues: {
      sum: 0,
      count: 0,
    },
  },
});

const generateTargetIndicator = (code, dataElement, target) => ({
  id: generateId(),
  code,
  builder: 'analyticArithmetic',
  config: {
    formula: `${target}`,
    aggregation: { [dataElement]: 'FINAL_EACH_YEAR' },
  },
});

const generateFiveYearIndicator = (code, dataElement, target) => ({
  id: generateId(),
  code,
  builder: 'analyticArithmetic',
  config: {
    formula: `${dataElement} >= ${target} ? 1 : ${dataElement} > firstExistingValue(value1YearAgo, value2YearsAgo, value3YearsAgo, value4YearsAgo, value5YearsAgo, Infinity) ? 0 : -1`,
    parameters: [
      {
        builder: 'analyticArithmetic',
        // 1 year is defined separately because I don't want to handle singular/plural year(s)
        code: 'value1YearAgo',
        config: {
          formula: `${dataElement}`,
          aggregation: [
            'FINAL_EACH_YEAR',
            {
              type: 'OFFSET_PERIOD',
              config: {
                offset: 1,
                periodType: 'year',
              },
            },
          ],
        },
      },
      ...[2, 3, 4, 5].map(year => ({
        builder: 'analyticArithmetic',
        code: `value${year}YearsAgo`,
        config: {
          formula: `${dataElement}`,
          aggregation: [
            'FINAL_EACH_YEAR',
            {
              type: 'OFFSET_PERIOD',
              config: {
                offset: year,
                periodType: 'year',
              },
            },
          ],
        },
      })),
    ],
    aggregation: 'FINAL_EACH_YEAR',
    defaultValues: {
      value1YearAgo: 'undefined',
      value2YearsAgo: 'undefined',
      value3YearsAgo: 'undefined',
      value4YearsAgo: 'undefined',
      value5YearsAgo: 'undefined',
    },
  },
});

const DRILL_DOWN_REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'csr_priority_district_average',
      'csr_non_priority_district_average',
      'csr_priority_district_target',
      'csr_non_priority_district_target',
    ],
    aggregations: [
      {
        type: 'FINAL_EACH_YEAR',
      },
    ],
  },
  transform: [
    {
      transform: 'updateColumns',
      insert: {
        "=translate($dataElement, { csr_priority_district_average: 'Priority Districts Average', csr_non_priority_district_average: 'Other Districts Average',  csr_priority_district_target: 'Priority Districts Target', csr_non_priority_district_target: 'Other Districts Target' })":
          '=$value/100',
        timestamp: '=periodToTimestamp($period)',
      },
      exclude: '*',
    },
    {
      transform: 'mergeRows',
      groupBy: 'timestamp',
    },
  ],
};

const DRILL_DOWN_FRONT_END_CONFIG = {
  name: 'Average Cohort Survival Rate',
  type: 'chart',
  chartType: 'line',
  xName: 'Year',
  yName: 'Rate (%)',
  periodGranularity: 'year',
  valueType: 'percentage',
  chartConfig: {
    'Priority Districts Target': {
      color: '#4caf50', // Green
    },
    'Other Districts Target': {
      color: '#ffeb3b', // Yellow
    },
    'Priority Districts Average': {
      color: '#9c27b0', // Purple
    },
    'Other Districts Average': {
      color: '#2196f3', // Blue
    },
  },
};

const LIST_REPORT_CONFIG = {
  fetch: {
    dataElements: ['csr_priority_district_summary', 'csr_non_priority_district_summary'],
    aggregations: [
      {
        type: 'MOST_RECENT',
      },
    ],
  },
  transform: [
    'keyValueByDataElementName',
    {
      transform: 'mergeRows',
      groupBy: ['organisationUnit', 'period'],
    },
    {
      transform: 'updateColumns',
      insert: {
        code: 'cohortSurvivalRate',
        // If stats red/yellow/green are equal use that value, otherwise default to yellow
        statistic:
          '=eq($csr_priority_district_summary, $csr_non_priority_district_summary) ? $csr_priority_district_summary : 0',
        label:
          'TARGET: Primary cohort survival rate – 2025 targets national average 90%, 40 districts 78%',
        parent: 'IO3',
      },
      exclude: '*',
    },
    // BUILD THE REST OF THE LIST
    {
      transform: 'insertRows',
      position: 'before',
      where: '=eq(@index, 1)',
      columns: {
        code: 'Strategy4',
        label:
          'Strategy 4: Promote Reading through provision of more age-appropriate reading materials and advocacy',
        parent: 'IO3',
      },
    },
    {
      transform: 'insertRows',
      position: 'before',
      where: '=eq(@index, 1)',
      columns: {
        code: 'Strategy3',
        label:
          'Strategy 3: Implement progressive promotion policy more effectively, including provision of appropriate remedial support',
        parent: 'IO3',
      },
    },
    {
      transform: 'insertRows',
      position: 'before',
      where: '=eq(@index, 1)',
      columns: {
        code: 'Strategy2',
        label:
          'Strategy 2: Improve the school environment to align with Fundamental Quality Standard',
        parent: 'IO3',
      },
    },
    {
      transform: 'insertRows',
      position: 'before',
      where: '=eq(@index, 1)',
      columns: {
        code: 'Strategy1',
        label:
          'Strategy 1: Development and implementation of a sustainable (human and financial resourcing) targeted primary school meals strategy and action plan',
        parent: 'IO3',
      },
    },
    {
      transform: 'insertRows',
      position: 'before',
      where: '=eq(@index, 1)',
      columns: {
        code: 'IO3',
        label:
          'IO 3: Increased intake and progression rates at all levels leading to increasing graduation rates (Part I HLO 1, IO 1.3)',
        parent: 'HLO1',
      },
    },
    {
      transform: 'insertRows',
      position: 'before',
      where: '=eq(@index, 1)',
      columns: {
        code: 'HLO1',
        label:
          'HLO 1: Increased number of graduates from primary education including NFE, with improved learning outcomes, particularly literacy and numeracy skills but also other 21st Century skills, with special focus on disadvantaged and gender equity',
      },
    },
  ],
};

const LIST_FRONT_END_CONFIG = {
  name: 'HLO1 List Summary',
  type: 'list',
  valueType: 'color',
  periodGranularity: 'year',
  drillDown: {
    itemCodeByEntry: {
      cohortSurvivalRate: 'LESMIS_cohort_survival_rate_national',
    },
  },
};

const INDICATOR_CONFIGS = [
  {
    baseCode: 'priority_district',
    targetValue: 78,
    attributeFilter: 'LESMIS_Target_District',
  },
  {
    baseCode: 'non_priority_district',
    targetValue: 90,
    attributeFilter: 'LESMIS_Non_Target_District',
  },
];

const generateAllIndicators = async db => {
  for (const { baseCode, targetValue, attributeFilter } of INDICATOR_CONFIGS) {
    await insertObject(
      db,
      'indicator',
      generateAverageIndicator(`csr_${baseCode}_average`, 'csr_district_pe_t', attributeFilter),
    );
    await insertObject(
      db,
      'indicator',
      generateTargetIndicator(`csr_${baseCode}_target`, `csr_${baseCode}_average`, targetValue),
    );
    await insertObject(
      db,
      'indicator',
      generateFiveYearIndicator(
        `csr_${baseCode}_summary`,
        `csr_${baseCode}_average`,
        `csr_${baseCode}_target`,
      ),
    );
  }
};

const deleteAllIndicators = async db => {
  for (const { baseCode } of INDICATOR_CONFIGS) {
    await deleteObject(db, 'indicator', { code: `csr_${baseCode}_summary` });
    await deleteObject(db, 'indicator', { code: `csr_${baseCode}_average` });
    await deleteObject(db, 'indicator', { code: `csr_${baseCode}_target` });
  }
};

const DASHBOARD_ITEMS = [
  {
    code: 'LESMIS_cohort_survival_rate_national',
    reportConfig: DRILL_DOWN_REPORT_CONFIG,
    frontEndConfig: DRILL_DOWN_FRONT_END_CONFIG,
  },
  {
    code: 'LESMIS_ESSDP_PE_HLO1',
    reportConfig: LIST_REPORT_CONFIG,
    frontEndConfig: LIST_FRONT_END_CONFIG,
  },
];

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

exports.up = async function (db) {
  await generateAllIndicators(db);
  for (const { code, frontEndConfig, reportConfig } of DASHBOARD_ITEMS) {
    await addNewDashboardItemAndReport(db, {
      code,
      frontEndConfig,
      reportConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LESMIS_ESSDP_PrimarySubSector_HLO1',
      entityTypes: ['country'],
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  await deleteAllIndicators(db);
  for (const { code } of DASHBOARD_ITEMS) {
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
