'use strict';

import {
  insertObject,
  deleteObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
  updateValues,
} from '../utilities';
import {
  NEW_TRANSFORM_STEPS,
  OLD_TRANSFORM_STEPS,
} from './migrationData/20210906025641-ESSDPListVisualNumberOfStudents';

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

// INDICATORS
const generateTotalIndicator = educationLevel => ({
  id: generateId(),
  code: `nostu_${educationLevel}_t`,
  builder: 'analyticArithmetic',
  config: {
    formula: `nostu_${educationLevel}_f_public + nostu_${educationLevel}_f_private + nostu_${educationLevel}_m_public + nostu_${educationLevel}_m_private`,
    aggregation: [
      'MOST_RECENT',
      {
        type: 'SUM_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'sub_district',
          aggregationEntityType: 'requested',
        },
      },
    ],
    defaultValues: {
      [`nostu_${educationLevel}_f_public`]: 0,
      [`nostu_${educationLevel}_f_private`]: 0,
      [`nostu_${educationLevel}_m_public`]: 0,
      [`nostu_${educationLevel}_m_private`]: 0,
    },
  },
});

const generateFiveYearIndicator = dataElementBase => ({
  id: generateId(),
  code: `${dataElementBase}_summary`,
  builder: 'analyticArithmetic',
  config: {
    formula: `${dataElementBase}_t > firstExistingValue(value1YearAgo, value2YearsAgo, value3YearsAgo, value4YearsAgo, value5YearsAgo, Infinity) ? 0 : -1`,
    parameters: [
      {
        builder: 'analyticArithmetic',
        code: 'value1YearAgo',
        config: {
          formula: `${dataElementBase}_t`,
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
          formula: `${dataElementBase}_t`,
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
          formula: `${dataElementBase}_t`,
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
          formula: `${dataElementBase}_t`,
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
          formula: `${dataElementBase}_t`,
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

// REPORT
const LOWER_SECONDARY_REPORT = {
  fetch: {
    dataElements: [`nostu_lse_summary`],
    aggregations: ['MOST_RECENT'],
  },
  transform: [
    'keyValueByDataElementName',
    // Build the list backwards, because higher level stats rely on lower levels
    {
      transform: 'select',
      where: 'exists($row.nostu_lse_summary)',
      "'code'": "'numberOfStudents'",
      "'label'": "'Number of Students: Gender, GPI, Total, in public schools, private'",
      "'statistic'": '$row.nostu_lse_summary',
      "'parent'": "'IO3'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'Strategy6'",
      "'label'":
        "'Strategy 6: Establish a qualifications framework linking formal and non-formal school-level education qualifications'",
      "'parent'": "'IO3'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'Strategy5'",
      "'label'": "'Strategy 5: Improve current lower secondary education services in all schools '",
      "'parent'": "'IO3'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'Strategy4'",
      "'label'":
        "'Strategy 4: Provide incentives to poor student in remote schools to improve enrolment rate'",
      "'parent'": "'IO3'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'Strategy3'",
      "'label'":
        "'Strategy 3: Improve lower secondary school environment to align with Fundamental Quality Standards'",
      "'parent'": "'IO3'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'Strategy2'",
      "'label'":
        "'Strategy 2: Expansion of inclusive WASH facilities and program at lower secondary level (See IO 6.3.5)'",
      "'parent'": "'IO3'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'Strategy1'",
      "'label'":
        "'Strategy 1: Review the current approach to expanding access to lower secondary, including the current 5+4+3 structure. '",
      "'parent'": "'IO3'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'IO3'",
      "'label'":
        "'IO 3: Increased intake and progression rates at all levels leading to increasing graduation rates (Part I HLO 1, IO 1.3)'",
      "'parent'": "'HLO1'",
      "'statistic'":
        'eq(max($where(f($otherRow) = equalText($otherRow.parent, "IO3")).statistic), min($where(f($otherRow) = equalText($otherRow.parent, "IO3")).statistic)) ? last($where(f($otherRow) = equalText($otherRow.parent, "IO3")).statistic) : 0',
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'HLO1'",
      "'label'":
        "'HLO 1: Increased number of graduates from LSE, with improved learning outcomes, particularly 21st Century skills, with special focus on disadvantaged and gender equity'",
      "'statistic'":
        'eq(max($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic), min($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic)) ? last($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic) : 0',
    },
  ],
};

const UPPER_SECONDARY_REPORT = {
  fetch: {
    dataElements: [`nostu_use_summary`],
    aggregations: ['MOST_RECENT'],
  },
  transform: [
    'keyValueByDataElementName',
    // Build the list backwards, because higher level stats rely on lower levels
    {
      transform: 'select',
      where: 'exists($row.nostu_use_summary)',
      "'code'": "'numberOfStudents'",
      "'label'": "'Number of Students: Gender, GPI, Total, in public schools, private'",
      "'statistic'": '$row.nostu_use_summary',
      "'parent'": "'IO1'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'Strategy3'",
      "'label'":
        "'Strategy 3: Develop an action plan to enable the efficient effective and sustainable targeted expansion of upper secondary education'",
      "'parent'": "'IO1'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'Strategy2'",
      "'label'":
        "'Strategy 2: Provide interventions to reduce drop-out rate in upper secondary education'",
      "'parent'": "'IO1'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'Strategy1'",
      "'label'":
        "'Strategy 1: Encourage lower secondary graduates with high academic performance to continue to upper secondary'",
      "'parent'": "'IO1'",
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'IO1'",
      "'label'":
        "'IO 1: Increased intake and progression rates at upper secondary level leading to increased graduation rates (Part I HLO 1, IO 1.3)'",
      "'parent'": "'HLO1'",
      "'statistic'":
        'eq(max($where(f($otherRow) = equalText($otherRow.parent, "IO1")).statistic), min($where(f($otherRow) = equalText($otherRow.parent, "IO1")).statistic)) ? last($where(f($otherRow) = equalText($otherRow.parent, "IO1")).statistic) : 0',
    },
    {
      transform: 'insert',
      position: 'before',
      where: 'eq($index, 1)',
      "'code'": "'HLO1'",
      "'label'":
        "'HLO 1: Increased number of graduates from upper secondary, with improved learning outcomes, particularly life skill, ICT skill but also basic vocational skills, with special focus on disadvantaged and gender equity'",
      "'statistic'":
        'eq(max($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic), min($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic)) ? last($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic) : 0',
    },
  ],
};

const BASE_FRONT_END_CONFIG = {
  name: 'ESSDP List Summary',
  type: 'list',
  valueType: 'color',
  periodGranularity: 'year',
};

const EDUCATION_LEVELS = ['ece', 'lse', 'use'];

const DASHBOARD_ITEMS = [
  {
    code: 'LESMIS_ESSDP_LSE_HLO1',
    reportConfig: LOWER_SECONDARY_REPORT,
    dashboardCode: 'LESMIS_ESSDP_LowerSecondarySubSector_HLO1',
    frontEndConfig: {
      ...BASE_FRONT_END_CONFIG,
      drillDown: { itemCodeByEntry: { numberOfStudents: 'LESMIS_ESSDP_lse_NumberOfStudents' } },
    },
  },
  {
    code: 'LESMIS_ESSDP_USE_HLO1',
    reportConfig: UPPER_SECONDARY_REPORT,
    dashboardCode: 'LESMIS_ESSDP_UpperSecondarySubSector_HLO1',
    frontEndConfig: {
      ...BASE_FRONT_END_CONFIG,
      drillDown: { itemCodeByEntry: { numberOfStudents: 'LESMIS_ESSDP_use_NumberOfStudents' } },
    },
  },
];

// Generate a total indicator for each education level
// Then generate a five year indicator for each of those totals
const addAllIndicators = async db => {
  for (const educationLevel of EDUCATION_LEVELS) {
    await insertObject(db, 'indicator', generateTotalIndicator(educationLevel));
    await insertObject(db, 'indicator', generateFiveYearIndicator(`nostu_${educationLevel}`));
  }
};

const removeAllIndicators = async db => {
  for (const educationLevel of EDUCATION_LEVELS) {
    const { code: fiveYearCode } = await generateFiveYearIndicator(`nostu_${educationLevel}`);
    const { code: totalCode } = await generateTotalIndicator(educationLevel);
    await deleteObject(db, 'indicator', { code: fiveYearCode });
    await deleteObject(db, 'indicator', { code: totalCode });
  }
};

// The ECE list already exists so needs special handling to insert a new row
const updateECEList = async db => {
  const listItem = await findSingleRecord(db, 'dashboard_item', { code: 'LESMIS_ESSDP_ECE_HLO1' });
  const report = await findSingleRecord(db, 'report', { code: 'LESMIS_ESSDP_ECE_HLO1' });
  // Update the dashboard item to be available at more entity levels
  await updateValues(
    db,
    'dashboard_relation',
    { entity_types: ['sub_district', 'district', 'country'] }, // new values
    { child_id: listItem.id }, // lookup value
  );

  // Create a 5 year indicator for 3_4 enrolment rate
  // Fixup the code to be more consistent with other enrolment indicators
  const indicator = generateFiveYearIndicator('er_district_ece_3_4');
  indicator.code = 'er_summary_ece_3_4_t';
  await insertObject(db, 'indicator', indicator);

  // Append new data elements
  // Update transform steps
  report.config.fetch.dataElements.push(indicator.code, 'nostu_ece_summary');
  report.config.transform = NEW_TRANSFORM_STEPS;

  // Update report
  await updateValues(
    db,
    'report',
    { config: report.config }, // new values
    { code: report.code }, // lookup values
  );

  // Append new drilldown to item config
  listItem.config.drillDown.itemCodeByEntry.numberOfStudents = 'LESMIS_ESSDP_ece_NumberOfStudents';
  // Update list item
  await updateValues(
    db,
    'dashboard_item',
    { config: listItem.config }, // new values
    { code: listItem.code }, // lookup values
  );
};

const downdateECEList = async db => {
  const listItem = await findSingleRecord(db, 'dashboard_item', { code: 'LESMIS_ESSDP_ECE_HLO1' });
  const report = await findSingleRecord(db, 'report', { code: 'LESMIS_ESSDP_ECE_HLO1' });
  // Remove the extra entity levels
  await updateValues(
    db,
    'dashboard_relation',
    { entity_types: ['sub_district'] }, // new values
    { child_id: listItem.id }, // lookup value
  );

  // Remove indicator
  await deleteObject(db, 'indicator', { code: 'er_summary_ece_3_4_t' });

  // Remove new dataElements
  // Update transform steps
  report.config.fetch.dataElements = report.config.fetch.dataElements.filter(
    element => element !== 'er_summary_ece_3_4_t' && element !== 'nostu_ece_summary',
  );
  report.config.transform = OLD_TRANSFORM_STEPS;

  // Update report
  await updateValues(
    db,
    'report',
    { config: report.config }, // new values
    { code: report.code }, // lookup values
  );

  // Remove drilldown from item config
  delete listItem.config.drillDown.itemCodeByEntry.numberOfStudents;
  // Update list item
  await updateValues(
    db,
    'dashboard_item',
    { config: listItem.config }, // new values
    { code: listItem.code }, // lookup values
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

exports.up = async function (db) {
  await addAllIndicators(db);
  for (const { code, reportConfig, frontEndConfig, dashboardCode } of DASHBOARD_ITEMS) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode,
      entityTypes: ['sub_district', 'district', 'country'],
      projectCodes: ['laos_schools'],
    });
  }
  await updateECEList(db);
};

exports.down = async function (db) {
  await removeAllIndicators(db);
  for (const { code } of DASHBOARD_ITEMS) {
    await removeDashboardItemAndReport(db, code);
  }
  await downdateECEList(db);
};

exports._meta = {
  version: 1,
};
