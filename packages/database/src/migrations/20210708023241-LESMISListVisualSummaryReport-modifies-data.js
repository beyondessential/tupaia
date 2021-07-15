'use strict';

import {
  insertObject,
  deleteObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
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

const generateIndicator = (code, dataElement, target) => ({
  id: generateId(),
  code,
  builder: 'analyticArithmetic',
  config: {
    formula: `${dataElement} >= ${target} ? 1 : ${dataElement} >= firstExistingValue(value1YearAgo, value2YearsAgo, value3YearsAgo, value4YearsAgo, value5YearsAgo, Infinity) ? 0 : -1`,
    parameters: [
      {
        builder: 'analyticArithmetic',
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
      {
        builder: 'analyticArithmetic',
        code: 'value2YearsAgo',
        config: {
          formula: `${dataElement}`,
          aggregation: [
            'FINAL_EACH_YEAR',
            {
              type: 'OFFSET_PERIOD',
              config: {
                offset: 2,
                periodType: 'year',
              },
            },
          ],
        },
      },
      {
        builder: 'analyticArithmetic',
        code: 'value3YearsAgo',
        config: {
          formula: `${dataElement}`,
          aggregation: [
            'FINAL_EACH_YEAR',
            {
              type: 'OFFSET_PERIOD',
              config: {
                offset: 3,
                periodType: 'year',
              },
            },
          ],
        },
      },
      {
        builder: 'analyticArithmetic',
        code: 'value4YearsAgo',
        config: {
          formula: `${dataElement}`,
          aggregation: [
            'FINAL_EACH_YEAR',
            {
              type: 'OFFSET_PERIOD',
              config: {
                offset: 4,
                periodType: 'year',
              },
            },
          ],
        },
      },
      {
        builder: 'analyticArithmetic',
        code: 'value5YearsAgo',
        config: {
          formula: `${dataElement}`,
          aggregation: [
            'FINAL_EACH_YEAR',
            {
              type: 'OFFSET_PERIOD',
              config: {
                offset: 5,
                periodType: 'year',
              },
            },
          ],
        },
      },
    ],
    aggregation: 'MOST_RECENT',
    defaultValues: {
      value1YearAgo: 'undefined',
      value2YearsAgo: 'undefined',
      value3YearsAgo: 'undefined',
      value4YearsAgo: 'undefined',
      value5YearsAgo: 'undefined',
    },
  },
});

const CODE = 'LESMIS_ESSDP_ECE_SubSector_List';

const REPORT_CONFIG = {
  fetch: {
    dataElements: ['er_summary_ece_0_2_t', 'er_summary_ece_5_t'],
    aggregations: [
      {
        type: 'MOST_RECENT',
        config: {
          dataSourceEntityType: 'sub_district',
        },
      },
    ],
  },
  transform: [
    'keyValueByDataElementName',
    'mostRecentValuePerOrgUnit',
    {
      transform: 'select',
      "'HLO1'": `{
        label:
          'HLO 1: Increased number of ECE graduates with improved primary school readiness, particularly literacy and numeracy skills with special focus on disadvantaged and gender equity',
        statistic: 0,
      }`,
      "'IO1_1'": `{
        label: 'IO 1.1: Increased access to quality ECE (Part I HLO 1, IOs 1.2 and 1.3)',
        statistic: 0,
        parent: 'HLO1',
      }`,
      "'Strategy1'": `{
        label:
          'Strategy 1: Prioritised and targeted expansion of the one-year pre-primary program subject to quality improvements to provide more access in smaller villages from more disadvantaged areas.',
        parent: 'IO1_1',
      }`,
      "'Strategy2'": `{
        label:
          'Strategy 2: Scaling up of proven innovations/pilots for 3-5-year olds, with priority on programmes for 5-year olds, such as multi-age teaching (more research may be needed)',
        parent: 'IO1_1',
      }`,
      "'Strategy3'": `{
        label: 'Strategy 3: Development of a sustainable and cost-effective (human and financial resourcing) targeted ECE school meals strategy and action plan',
        parent: 'IO1_1',
      }`,
      "'Strategy4'": `{
        label: 'Strategy 4: Expansion of WASH facilities and program at ECE level, particularly for girls and children with disabilities',
        parent: 'IO1_1',
      }`,
      "'Strategy5'": `{
        label: 'Strategy 5: Encourage individuals, organizations, local and international investors to invest in ECE development.',
        parent: 'IO1_1',
      }`,
      "'ECETarget0_2'": `{
        label:
          'TARGET: Enrolment rate of 0-2 years old children: gender, GPI, total – 2025 target of 7%',
        statistic: $row.er_summary_ece_0_2_t,
        parent: 'IO1_1',
      }`,
      "'ECETarget3_4'": `{
        label: 'Enrolment rate of 3-4 years old children: gender, GPI, total (No 2025 target)*',
        parent: 'IO1_1',
      }`,
      "'ECETarget5'": `{
        label:
          'TARGET: Enrolment rate of 5-year-old children: gender, GPI, total – 2025 target of 86%',
        statistic: $row.er_summary_ece_5_t,
        parent: 'IO1_1',
      }`,
    },
  ],
};

const FRONT_END_CONFIG = {
  name: 'ESSDP List Summary',
  type: 'list',
  valueType: 'trafficLight',
  drillDown: {
    entryCodeMap: {
      ECETarget0_2: 'LESMIS_enrolment_ece_0_2_target',
      ECETarget3_4: 'LESMIS_enrolment_ece_3_4_target',
      ECETarget5: 'LESMIS_enrolment_ece_5_target',
    },
  },
};

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
  await insertObject(
    db,
    'indicator',
    generateIndicator('er_summary_ece_0_2_t', 'er_district_ece_0_2_t', 'er_target_ece_0_2_t'),
  );
  await insertObject(
    db,
    'indicator',
    generateIndicator('er_summary_ece_5_t', 'er_district_ece_5_t', 'er_target_ece_5_t'),
  );
  await addNewDashboardItemAndReport(db, {
    code: CODE,
    frontEndConfig: FRONT_END_CONFIG,
    reportConfig: REPORT_CONFIG,
    permissionGroup: 'LESMIS Public',
    dashboardCode: 'LESMIS_ESSDP_EarlyChildhoodSubSector_Schools',
    entityTypes: ['sub_district'],
    projectCodes: ['laos_schools'],
  });
};

exports.down = async function (db) {
  deleteObject(db, 'indicator', { code: 'er_summary_ece_0_2_t' });
  deleteObject(db, 'indicator', { code: 'er_summary_ece_5_t' });
  await removeDashboardItemAndReport(db, CODE);
};

exports._meta = {
  version: 1,
};
