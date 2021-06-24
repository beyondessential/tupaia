'use strict';

import { insertObject, deleteObject, generateId, findSingleRecord } from '../utilities';

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

/*
 * Data
 */

const BASE_FRONT_END_CONFIG = {
  type: 'chart',
  chartType: 'bar',
  xName: 'Gender',
  yName: 'Gross Intake Ratio',
  periodGranularity: 'one_year_at_a_time',
  chartConfig: {
    'Gross Intake Ratio': {
      stackId: '1',
    },
  },
  presentationOptions: {
    hideAverage: true,
  },
};

const PRIMARY = {
  code: 'LESMIS_gross_intake_ratio_primary',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Primary Education',
    ...BASE_FRONT_END_CONFIG,
  },
  reportConfig: {
    fetch: {
      dataElements: [
        'lesmis_student_p5_f',
        'lesmis_student_rpt_p5_f',
        'population_LA_age10_f',
        'lesmis_student_p5_m',
        'lesmis_student_rpt_p5_m',
        'population_LA_age10_m',
        'lesmis_student_p5_t',
        'lesmis_student_rpt_p5_t',
        'population_LA_age10_t',
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'":
          "translate($row.dataElement, { lesmis_student_p5_f: 'Female', lesmis_student_rpt_p5_f: 'Female', population_LA_age10_f: 'Female', lesmis_student_p5_m: 'Male', lesmis_student_rpt_p5_m: 'Male', population_LA_age10_m: 'Male', lesmis_student_p5_t: 'Total', lesmis_student_rpt_p5_t: 'Total', population_LA_age10_t: 'Total' })",
        '...': ['value', 'dataElement'],
      },
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'sum',
      },
      {
        transform: 'select',
        "'totalStudents'":
          'sum([$row.lesmis_student_p5_f, $row.lesmis_student_p5_m, $row.lesmis_student_p5_t])',
        "'repeatStudents'":
          'sum([$row.lesmis_student_rpt_p5_f, $row.lesmis_student_rpt_p5_m, $row.lesmis_student_rpt_p5_t])',
        "'population'":
          'sum([$row.population_LA_age10_f, $row.population_LA_age10_m, $row.population_LA_age10_t])',
        '...': ['name'],
      },
      {
        transform: 'select',
        "'Gross Intake Ratio'": '($row.totalStudents - $row.repeatStudents) / $row.population',
        '...': ['name'],
      },
    ],
  },
};

const LOWER_SECONDARY = {
  code: 'LESMIS_gross_intake_ratio_lower_secondary',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Lower Secondary Education',
    ...BASE_FRONT_END_CONFIG,
  },
  reportConfig: {
    fetch: {
      dataElements: [
        'lesmis_student_s4_f',
        'lesmis_student_rpt_s4_f',
        'population_LA_age14_f',
        'lesmis_student_s4_m',
        'lesmis_student_rpt_s4_m',
        'population_LA_age14_m',
        'lesmis_student_s4_t',
        'lesmis_student_rpt_s4_t',
        'population_LA_age14_t',
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'":
          "translate($row.dataElement, { lesmis_student_s4_f: 'Female', lesmis_student_rpt_s4_f: 'Female', population_LA_age14_f: 'Female', lesmis_student_s4_m: 'Male', lesmis_student_rpt_s4_m: 'Male', population_LA_age14_m: 'Male', lesmis_student_s4_t: 'Total', lesmis_student_rpt_s4_t: 'Total', population_LA_age14_t: 'Total' })",
        '...': ['value', 'dataElement'],
      },
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'sum',
      },
      {
        transform: 'select',
        "'totalStudents'":
          'sum([$row.lesmis_student_s4_f, $row.lesmis_student_s4_m, $row.lesmis_student_s4_t])',
        "'repeatStudents'":
          'sum([$row.lesmis_student_rpt_s4_f, $row.lesmis_student_rpt_s4_m, $row.lesmis_student_rpt_s4_t])',
        "'population'":
          'sum([$row.population_LA_age14_f, $row.population_LA_age14_m, $row.population_LA_age14_t])',
        '...': ['name'],
      },
      {
        transform: 'select',
        "'Gross Intake Ratio'": '($row.totalStudents - $row.repeatStudents) / $row.population',
        '...': ['name'],
      },
    ],
  },
};

const UPPER_SECONDARY = {
  code: 'LESMIS_gross_intake_ratio_upper_secondary',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Upper Secondary Education',
    ...BASE_FRONT_END_CONFIG,
  },
  reportConfig: {
    fetch: {
      dataElements: [
        'lesmis_student_s7_f',
        'lesmis_student_rpt_s7_f',
        'population_LA_age17_f',
        'lesmis_student_s7_m',
        'lesmis_student_rpt_s7_m',
        'population_LA_age17_m',
        'lesmis_student_s7_t',
        'lesmis_student_rpt_s7_t',
        'population_LA_age17_t',
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'":
          "translate($row.dataElement, { lesmis_student_s7_f: 'Female', lesmis_student_rpt_s7_f: 'Female', population_LA_age17_f: 'Female', lesmis_student_s7_m: 'Male', lesmis_student_rpt_s7_m: 'Male', population_LA_age17_m: 'Male', lesmis_student_s7_t: 'Total', lesmis_student_rpt_s7_t: 'Total', population_LA_age17_t: 'Total' })",
        '...': ['value', 'dataElement'],
      },
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'sum',
      },
      {
        transform: 'select',
        "'totalStudents'":
          'sum([$row.lesmis_student_s7_f, $row.lesmis_student_s7_m, $row.lesmis_student_s7_t])',
        "'repeatStudents'":
          'sum([$row.lesmis_student_rpt_s7_f, $row.lesmis_student_rpt_s7_m, $row.lesmis_student_rpt_s7_t])',
        "'population'":
          'sum([$row.population_LA_age17_f, $row.population_LA_age17_m, $row.population_LA_age17_t])',
        '...': ['name'],
      },
      {
        transform: 'select',
        "'Gross Intake Ratio'": '($row.totalStudents - $row.repeatStudents) / $row.population',
        '...': ['name'],
      },
    ],
  },
};

/*
 *  INDICATOR HELPER FUNCTIONS
 */

// Generate an inclusive range
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => index + start);

// Creates an indicator object that sums between genders
const sumGendersIndicator = baseCode => {
  const maleCode = `${baseCode}_m`;
  const femaleCode = `${baseCode}_f`;
  const totalCode = `${baseCode}_t`;

  return {
    id: generateId(),
    code: totalCode,
    builder: 'analyticArithmetic',
    config: {
      formula: `${maleCode} + ${femaleCode}`,
      aggregation: 'MOST_RECENT',
      defaultValues: {
        [maleCode]: 0,
        [femaleCode]: 0,
      },
    },
  };
};

// Creates an indicator object that sums ages for a grade
const sumAgesIndicator = (baseCode, ageRange, grade, gender) => {
  const elementCodes = ageRange.map(age => `${baseCode}_age${age}_${grade}_${gender}`);
  const totalCode = `${baseCode}_${grade}_${gender}`;

  return {
    id: generateId(),
    code: totalCode,
    builder: 'analyticArithmetic',
    config: {
      formula: elementCodes.join(' + '),
      aggregation: [
        { type: 'MOST_RECENT' },
        {
          type: 'SUM_PER_ORG_GROUP',
          config: { dataSourceEntityType: 'school', aggregationEntityType: 'requested' },
        },
      ],
      defaultValues: Object.fromEntries(elementCodes.map(code => [code, 0])),
    },
  };
};

const addIndicatorsForAgeAndGrade = async (db, ageRange, grade) => {
  await insertObject(db, 'indicator', sumAgesIndicator('lesmis_student', ageRange, grade, 'm'));
  await insertObject(db, 'indicator', sumAgesIndicator('lesmis_student', ageRange, grade, 'f'));
  await insertObject(db, 'indicator', sumAgesIndicator('lesmis_student_rpt', ageRange, grade, 'm'));
  await insertObject(db, 'indicator', sumAgesIndicator('lesmis_student_rpt', ageRange, grade, 'f'));
  await insertObject(db, 'indicator', sumGendersIndicator(`lesmis_student_${grade}`));
  await insertObject(db, 'indicator', sumGendersIndicator(`lesmis_student_rpt_${grade}`));
};

const removeIndicatorsForGrade = async (db, grade) => {
  await deleteObject(db, 'indicator', { code: `lesmis_student_${grade}_m` });
  await deleteObject(db, 'indicator', { code: `lesmis_student_${grade}_f` });
  await deleteObject(db, 'indicator', { code: `lesmis_student_${grade}_t` });
  await deleteObject(db, 'indicator', { code: `lesmis_student_rpt_${grade}_m` });
  await deleteObject(db, 'indicator', { code: `lesmis_student_rpt_${grade}_f` });
  await deleteObject(db, 'indicator', { code: `lesmis_student_rpt_${grade}_t` });
};

/*
 * Report/Dashboard Helper Functions
 */

const addNewDashboardItemAndReport = async (
  db,
  { code, frontEndConfig, reportConfig, permissionGroup, dashboardCode, entityTypes, projectCodes },
) => {
  // insert report
  const reportId = generateId();
  const permissionGroupId = (
    await findSingleRecord(db, `SELECT id FROM permission_group WHERE name = '${permissionGroup}';`)
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
  const dashboardId = (
    await findSingleRecord(db, `SELECT id FROM dashboard WHERE code = '${dashboardCode}'`)
  ).id;
  const maxSortOrder = (
    await findSingleRecord(
      db,
      `SELECT max(sort_order) as max_sort_order FROM dashboard_relation WHERE dashboard_id = '${dashboardId}';`,
    )
  ).max_sort_order;
  await await insertObject(db, 'dashboard_relation', {
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

/*
 * Actual migration
 */

exports.up = async function (db) {
  await addIndicatorsForAgeAndGrade(db, range(4, 15), 'p5');
  await addIndicatorsForAgeAndGrade(db, range(11, 21), 's4');
  await addIndicatorsForAgeAndGrade(db, range(11, 21), 's7');
  await insertObject(db, 'indicator', sumGendersIndicator('population_LA_age10'));
  await insertObject(db, 'indicator', sumGendersIndicator('population_LA_age14'));
  await insertObject(db, 'indicator', sumGendersIndicator('population_LA_age17'));

  for (const { code, reportConfig, frontEndConfig } of [
    PRIMARY,
    LOWER_SECONDARY,
    UPPER_SECONDARY,
  ]) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LA_Students',
      entityTypes: ['sub_district'],
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  await removeIndicatorsForGrade(db, 'p5');
  await removeIndicatorsForGrade(db, 's4');
  await removeIndicatorsForGrade(db, 's7');
  await deleteObject(db, 'indicator', { code: 'population_LA_age10_t' });
  await deleteObject(db, 'indicator', { code: 'population_LA_age14_t' });
  await deleteObject(db, 'indicator', { code: 'population_LA_age17_t' });

  for (const { code } of [PRIMARY, LOWER_SECONDARY, UPPER_SECONDARY]) {
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
