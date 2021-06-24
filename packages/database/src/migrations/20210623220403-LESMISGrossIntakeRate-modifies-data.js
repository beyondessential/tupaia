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
 * DATA
 */

// Generate an inclusive range
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => index + start);

const generateDistrictReportConfig = ({ educationLevel }) => {
  return {
    fetch: {
      dataElements: [
        `gir_district_${educationLevel}_m`,
        `gir_district_${educationLevel}_f`,
        `gir_district_${educationLevel}_t`,
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'": `translate($row.dataElement, { gir_district_${educationLevel}_m: 'Male', gir_district_${educationLevel}_f: 'Female', gir_district_${educationLevel}_t: 'Total' })`,
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
        "'Gross Intake Ratio'": `sum([$row.gir_district_${educationLevel}_m, $row.gir_district_${educationLevel}_f, $row.gir_district_${educationLevel}_t])`,
        '...': ['name'],
      },
    ],
  };
};

const GIR_CONFIG_PRIMARY = {
  grade: 'p5',
  populationAge: '10',
  ageRange: range(4, 15),
  educationLevel: 'pe',
};
const GIR_CONFIG_LOWER_SECONDARY = {
  grade: 's4',
  populationAge: '14',
  ageRange: range(11, 21),
  educationLevel: 'lse',
};
const GIR_CONFIG_UPPER_SECONDARY = {
  grade: 's7',
  populationAge: '17',
  ageRange: range(11, 21),
  educationLevel: 'use',
};

const DISTRICT_BASE_FRONT_END_CONFIG = {
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

const DISTRICT_LEVEL_PRIMARY = {
  code: 'LESMIS_gross_intake_ratio_primary',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Primary Education',
    ...DISTRICT_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateDistrictReportConfig(GIR_CONFIG_PRIMARY),
};

const DISTRICT_LEVEL_LOWER_SECONDARY = {
  code: 'LESMIS_gross_intake_ratio_lower_secondary',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Lower Secondary Education',
    ...DISTRICT_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateDistrictReportConfig(GIR_CONFIG_LOWER_SECONDARY),
};

const DISTRICT_LEVEL_UPPER_SECONDARY = {
  code: 'LESMIS_gross_intake_ratio_upper_secondary',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Upper Secondary Education',
    ...DISTRICT_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateDistrictReportConfig(GIR_CONFIG_UPPER_SECONDARY),
};

const PROVINCE_LEVEL_PRIMARY = {};
const PROVINCE_LEVEL_LOWER_SECONDARY = {};
const PROVINCE_LEVEL_UPPER_SECONDARY = {};

/*
 *  INDICATOR HELPER FUNCTIONS
 */

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

// Creates a GIR indicator
const grossIntakeRatioIndicator = ({ grade, populationAge, educationLevel }, gender) => {
  const indicatorCode = `gir_district_${educationLevel}_${gender}`;
  const students = `lesmis_student_${grade}_${gender}`;
  const repeats = `lesmis_student_rpt_${grade}_${gender}`;
  const population = `population_LA_age${populationAge}_${gender}`;

  return {
    id: generateId(),
    code: indicatorCode,
    builder: 'analyticArithmetic',
    config: {
      formula: `(${students} - ${repeats}) / ${population}`,
      aggregation: 'MOST_RECENT',
      defaultValues: {
        [students]: 0,
        [repeats]: 0,
        [population]: 0,
      },
    },
  };
};

const addIndicatorsForAgeAndGrade = async (db, { ageRange, grade }) => {
  for (const gender of ['m', 'f']) {
    await insertObject(
      db,
      'indicator',
      sumAgesIndicator('lesmis_student', ageRange, grade, gender),
    );
    await insertObject(
      db,
      'indicator',
      sumAgesIndicator('lesmis_student_rpt', ageRange, grade, gender),
    );
  }
  await insertObject(db, 'indicator', sumGendersIndicator(`lesmis_student_${grade}`));
  await insertObject(db, 'indicator', sumGendersIndicator(`lesmis_student_rpt_${grade}`));
};

const addAllGIRIndicators = async (db, config) => {
  await addIndicatorsForAgeAndGrade(db, config);
  await insertObject(
    db,
    'indicator',
    sumGendersIndicator(`population_LA_age${config.populationAge}`),
  );
  for (const gender of ['m', 'f', 't']) {
    await insertObject(db, 'indicator', grossIntakeRatioIndicator(config, gender));
  }
};

const removeAllGIRIndicators = async (db, { grade, populationAge, educationLevel }) => {
  for (const gender of ['m', 'f', 't']) {
    await deleteObject(db, 'indicator', { code: `lesmis_student_${grade}_${gender}` });
    await deleteObject(db, 'indicator', { code: `lesmis_student_rpt_${grade}_${gender}` });
    await deleteObject(db, 'indicator', { code: `gir_district_${educationLevel}_${gender}` });
  }
  await deleteObject(db, 'indicator', { code: `population_LA_age${populationAge}_t` });
};

/*
 * REPORT/DASHBOARD HELPER FUNCTIONS
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
  for (const config of [
    GIR_CONFIG_PRIMARY,
    GIR_CONFIG_LOWER_SECONDARY,
    GIR_CONFIG_UPPER_SECONDARY,
  ]) {
    await addAllGIRIndicators(db, config);
  }

  for (const { code, reportConfig, frontEndConfig } of [
    DISTRICT_LEVEL_PRIMARY,
    DISTRICT_LEVEL_LOWER_SECONDARY,
    DISTRICT_LEVEL_UPPER_SECONDARY,
  ]) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LESMIS_International_SDGs_students',
      entityTypes: ['sub_district'],
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const config of [
    GIR_CONFIG_PRIMARY,
    GIR_CONFIG_LOWER_SECONDARY,
    GIR_CONFIG_UPPER_SECONDARY,
  ]) {
    await removeAllGIRIndicators(db, config);
  }

  for (const { code } of [
    DISTRICT_LEVEL_PRIMARY,
    DISTRICT_LEVEL_LOWER_SECONDARY,
    DISTRICT_LEVEL_UPPER_SECONDARY,
  ]) {
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
