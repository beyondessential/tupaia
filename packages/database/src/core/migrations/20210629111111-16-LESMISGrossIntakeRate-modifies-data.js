'use strict';

import {
  insertObject,
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

/*
 * DATA
 */

// Generate an inclusive range
const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => index + start);

const generateSummaryReportConfig = ({ entityLevel, educationLevel }) => {
  return {
    fetch: {
      dataElements: [
        `gir_${entityLevel}_${educationLevel}_m`,
        `gir_${entityLevel}_${educationLevel}_f`,
        `gir_${entityLevel}_${educationLevel}_t`,
      ],
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: 'sub_district',
          },
        },
      ],
    },
    transform: [
      'keyValueByDataElementName',
      {
        transform: 'select',
        "'Male'": `exists($row.gir_${entityLevel}_${educationLevel}_m) ? $row.gir_${entityLevel}_${educationLevel}_m/100 : undefined`,
        "'Female'": `exists($row.gir_${entityLevel}_${educationLevel}_f) ? $row.gir_${entityLevel}_${educationLevel}_f/100 : undefined`,
        "'Total'": `exists($row.gir_${entityLevel}_${educationLevel}_t) ? $row.gir_${entityLevel}_${educationLevel}_t/100 : undefined`,
        "'timestamp'": 'periodToTimestamp($row.period)',
      },
      {
        transform: 'aggregate',
        timestamp: 'group',
        '...': 'last',
      },
    ],
  };
};

const generateProvinceReportConfig = ({ educationLevel }) => {
  return {
    fetch: {
      dataElements: [
        `gir_district_${educationLevel}_m`,
        `gir_district_${educationLevel}_f`,
        `gir_district_${educationLevel}_t`,
      ],
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
      {
        transform: 'select',
        "'Male'": `exists($row.gir_district_${educationLevel}_m) ? $row.gir_district_${educationLevel}_m/100 : undefined`,
        "'Female'": `exists($row.gir_district_${educationLevel}_f) ? $row.gir_district_${educationLevel}_f/100 : undefined`,
        "'Total'": `exists($row.gir_district_${educationLevel}_t) ? $row.gir_district_${educationLevel}_t/100 : undefined`,
        "'name'": '$row.organisationUnit',
      },
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'sum',
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

const SUMMARY_BASE_FRONT_END_CONFIG = {
  type: 'chart',
  chartType: 'line',
  xName: 'Year',
  yName: 'Gross Intake Ratio',
  periodGranularity: 'year',
  valueType: 'percentage',
  chartConfig: {
    Male: {
      color: '#f44336',
      legendOrder: '1',
    },
    Female: {
      color: '#2196f3',
      legendOrder: '2',
    },
    Total: {
      color: '#9c27b0',
      legendOrder: '3',
    },
  },
};

const PROVINCE_BASE_FRONT_END_CONFIG = {
  type: 'chart',
  chartType: 'bar',
  xName: 'District',
  yName: 'Gross Intake Ratio',
  periodGranularity: 'one_year_at_a_time',
  valueType: 'percentage',
  chartConfig: {
    Male: {
      color: '#f44336',
      stackId: '1',
      legendOrder: '1',
    },
    Female: {
      color: '#2196f3',
      stackId: '2',
      legendOrder: '2',
    },
    Total: {
      color: '#9c27b0',
      stackId: '3',
      legendOrder: '3',
    },
  },
};

const DISTRICT_LEVEL_PRIMARY = {
  code: 'LESMIS_gross_intake_ratio_primary_district',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Primary Education',
    ...SUMMARY_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateSummaryReportConfig({
    entityLevel: 'district',
    ...GIR_CONFIG_PRIMARY,
  }),
  entityTypes: ['sub_district'],
};
const DISTRICT_LEVEL_LOWER_SECONDARY = {
  code: 'LESMIS_gross_intake_ratio_lower_secondary_district',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Lower Secondary Education',
    ...SUMMARY_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateSummaryReportConfig({
    entityLevel: 'district',
    ...GIR_CONFIG_LOWER_SECONDARY,
  }),
  entityTypes: ['sub_district'],
};
const DISTRICT_LEVEL_UPPER_SECONDARY = {
  code: 'LESMIS_gross_intake_ratio_upper_secondary_district',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Upper Secondary Education',
    ...SUMMARY_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateSummaryReportConfig({
    entityLevel: 'district',
    ...GIR_CONFIG_UPPER_SECONDARY,
  }),
  entityTypes: ['sub_district'],
};
const PROVINCE_LEVEL_PRIMARY = {
  code: 'LESMIS_gross_intake_ratio_primary_province',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Primary Education',
    ...SUMMARY_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateSummaryReportConfig({
    entityLevel: 'province',
    ...GIR_CONFIG_PRIMARY,
  }),
  entityTypes: ['district'],
};
const PROVINCE_LEVEL_LOWER_SECONDARY = {
  code: 'LESMIS_gross_intake_ratio_lower_secondary_province',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Lower Secondary Education',
    ...SUMMARY_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateSummaryReportConfig({
    entityLevel: 'province',
    ...GIR_CONFIG_LOWER_SECONDARY,
  }),
  entityTypes: ['district'],
};
const PROVINCE_LEVEL_UPPER_SECONDARY = {
  code: 'LESMIS_gross_intake_ratio_upper_secondary_province',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Upper Secondary Education',
    ...SUMMARY_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateSummaryReportConfig({
    entityLevel: 'province',
    ...GIR_CONFIG_UPPER_SECONDARY,
  }),
  entityTypes: ['district'],
};
const COUNTRY_LEVEL_PRIMARY = {
  code: 'LESMIS_gross_intake_ratio_primary_country',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Primary Education',
    ...SUMMARY_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateSummaryReportConfig({
    entityLevel: 'country',
    ...GIR_CONFIG_PRIMARY,
  }),
  entityTypes: ['country'],
};
const COUNTRY_LEVEL_LOWER_SECONDARY = {
  code: 'LESMIS_gross_intake_ratio_lower_secondary_country',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Lower Secondary Education',
    ...SUMMARY_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateSummaryReportConfig({
    entityLevel: 'country',
    ...GIR_CONFIG_LOWER_SECONDARY,
  }),
  entityTypes: ['country'],
};
const COUNTRY_LEVEL_UPPER_SECONDARY = {
  code: 'LESMIS_gross_intake_ratio_upper_secondary_country',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Upper Secondary Education',
    ...SUMMARY_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateSummaryReportConfig({
    entityLevel: 'country',
    ...GIR_CONFIG_UPPER_SECONDARY,
  }),
  entityTypes: ['country'],
};

const PROVINCE_LEVEL_PRIMARY_DISTRICT_SUMMARY = {
  code: 'LESMIS_gross_intake_ratio_primary_province_summary',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Primary Education',
    ...PROVINCE_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateProvinceReportConfig(GIR_CONFIG_PRIMARY),
  entityTypes: ['district'],
};
const PROVINCE_LEVEL_LOWER_SECONDARY_DISTRICT_SUMMARY = {
  code: 'LESMIS_gross_intake_ratio_lower_secondary_province_summary',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Primary Education',
    ...PROVINCE_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateProvinceReportConfig(GIR_CONFIG_LOWER_SECONDARY),
  entityTypes: ['district'],
};
const PROVINCE_LEVEL_UPPER_SECONDARY_DISTRICT_SUMMARY = {
  code: 'LESMIS_gross_intake_ratio_upper_secondary_province_summary',
  frontEndConfig: {
    name: 'Gross Intake Ratio to the Last Grade of Primary Education',
    ...PROVINCE_BASE_FRONT_END_CONFIG,
  },
  reportConfig: generateProvinceReportConfig(GIR_CONFIG_UPPER_SECONDARY),
  entityTypes: ['district'],
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
  for (const { code, reportConfig, frontEndConfig, entityTypes } of [
    DISTRICT_LEVEL_PRIMARY,
    DISTRICT_LEVEL_LOWER_SECONDARY,
    DISTRICT_LEVEL_UPPER_SECONDARY,
    PROVINCE_LEVEL_PRIMARY,
    PROVINCE_LEVEL_LOWER_SECONDARY,
    PROVINCE_LEVEL_UPPER_SECONDARY,
    COUNTRY_LEVEL_PRIMARY,
    COUNTRY_LEVEL_LOWER_SECONDARY,
    COUNTRY_LEVEL_UPPER_SECONDARY,
    PROVINCE_LEVEL_PRIMARY_DISTRICT_SUMMARY,
    PROVINCE_LEVEL_LOWER_SECONDARY_DISTRICT_SUMMARY,
    PROVINCE_LEVEL_UPPER_SECONDARY_DISTRICT_SUMMARY,
  ]) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LESMIS_International_SDGs_students',
      entityTypes,
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const { code } of [
    DISTRICT_LEVEL_PRIMARY,
    DISTRICT_LEVEL_LOWER_SECONDARY,
    DISTRICT_LEVEL_UPPER_SECONDARY,
    PROVINCE_LEVEL_PRIMARY,
    PROVINCE_LEVEL_LOWER_SECONDARY,
    PROVINCE_LEVEL_UPPER_SECONDARY,
    COUNTRY_LEVEL_PRIMARY,
    COUNTRY_LEVEL_LOWER_SECONDARY,
    COUNTRY_LEVEL_UPPER_SECONDARY,
    PROVINCE_LEVEL_PRIMARY_DISTRICT_SUMMARY,
    PROVINCE_LEVEL_LOWER_SECONDARY_DISTRICT_SUMMARY,
    PROVINCE_LEVEL_UPPER_SECONDARY_DISTRICT_SUMMARY,
  ]) {
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
