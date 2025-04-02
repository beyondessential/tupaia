'use strict';

import { insertObject, generateId, findSingleRecord, findSingleRecordBySql } from '../utilities';

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

const CODE = 'TO_Custom_Export_COVID_Contact_Tracing_Combined';

const LEGACY_REPORT_CONFIG = {
  surveys: [
    {
      name: 'Contact Tracing',
      codes: ['CCLF', 'CCFU'],
    },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      skipHeader: true,
      surveysConfig: {
        CCFU: {
          mergeRowKey: 'orgUnit',
          columnLabels: {
            TO_FCF_05: 'Current Test Status',
            TO_FCF_06: 'Are they Symptomatic?',
            TO_FCF_07: 'Comments on symptoms',
            TO_FCF_08: 'Day number of follow up',
            TO_FCF_09: 'Method of follow up',
            TO_FCF_10: 'Contact Status',
            TO_FCF_12: 'Temperature',
            TO_FCF_13: 'Quarantine Outcome',
            TO_FCF_14: 'Date of outcome',
          },
          entityAggregation: {
            dataSourceEntityType: 'case',
          },
        },
        CCLF: {
          mergeRowKey: 'orgUnit',
          columnLabels: {
            TO_C19CLF02: 'Case ID this contact is linked to',
            TO_C19CLF03: 'First Name',
            TO_C19CLF04: 'Middle Name',
            TO_C19CLF05: 'Surname',
            TO_C19CLF06: 'Head of Household',
            TO_C19CLF07: 'Sex',
            TO_C19CLF08: 'Age',
            TO_C19CLF09: 'Address',
            TO_C19CLF10: 'Telephone Number',
            TO_C19CLF11: 'Which category do they fit into?',
            TO_C19CLF12: 'If Other, Specify',
            TO_C19CLF14: 'Facility Name',
            TO_C19CLF15: 'Relation to Case',
            TO_C19CLF16: 'Last contact with case',
            TO_C19CLF17: 'Date at 14 days forward from this exposure',
            TO_C19CLF18: 'Describe type and length of exposure and where',
            TO_C19CLF19: 'Link to cluster?',
            TO_C19CLF20: 'If yes, cluster ID',
            TO_C19CLF21: 'Any further comments',
            TO_C19CLF22: 'Contact ID',
            TO_C19CLF26: 'Ever received a vaccine for COVID-19?',
            TO_C19CLF27: 'Type of Vaccine:',
            TO_C19CLF28: 'If Other, Specify',
            TO_C19CLF29: 'Dose 1 Completed',
            TO_C19CLF30: 'Date of vaccination',
            TO_C19CLF31: 'Dose 2 completed',
            TO_C19CLF32: 'Date of vaccination',
            TO_C19CLF33: 'Source of vaccination information?',
            TO_C19CLF34: 'If Other, Specify',
          },
          entityAggregation: {
            dataSourceEntityType: 'case',
          },
          entityIdToNameElements: ['TO_C19CLF09', 'TO_C19CLF02'],
        },
      },
      transformations: [
        {
          type: 'mergeSurveys',
          mergedTableName: 'Contact Tracing Data',
        },
        {
          type: 'transposeMatrix',
        },
      ],
    },
  },
};

const FRONT_END_CONFIG = {
  name: 'Download Contact Tracing Information',
  type: 'view',
  viewType: 'dataDownload',
  periodGranularity: 'year',
};

// Util functions adjusted for legacy report
const addNewDashboardItemAndLegacyReport = async (
  db,
  {
    code,
    frontEndConfig,
    dataBuilder,
    reportConfig,
    permissionGroup,
    dashboardCode,
    entityTypes,
    projectCodes,
  },
) => {
  // insert report
  const reportId = generateId();
  const permissionGroupId = (
    await findSingleRecord(db, 'permission_group', { name: permissionGroup })
  ).id;
  await insertObject(db, 'legacy_report', {
    id: reportId,
    code,
    data_builder: dataBuilder,
    data_builder_config: reportConfig,
  });

  // insert dashboard item
  const dashboardItemId = generateId();
  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code,
    config: frontEndConfig,
    report_code: code,
    legacy: true,
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
  await db.runSql(`DELETE FROM legacy_report WHERE code = '${code}';`);
};

exports.up = async function (db) {
  await addNewDashboardItemAndLegacyReport(db, {
    code: CODE,
    reportConfig: LEGACY_REPORT_CONFIG,
    dataBuilder: 'surveyDataExport',
    frontEndConfig: FRONT_END_CONFIG,
    permissionGroup: 'COVID-19 Senior',
    dashboardCode: 'TO_COVID-19',
    entityTypes: ['country'],
    projectCodes: ['fanafana'],
  });
  await db.runSql(`
    UPDATE project
    SET permission_groups = array_append(permission_groups, 'COVID-19 Senior')
    WHERE code = 'fanafana'
  `);
};

exports.down = async function (db) {
  await removeDashboardItemAndReport(db, CODE);
  await db.runSql(`
    UPDATE project
    SET permission_groups = array_remove(permission_groups, 'COVID-19 Senior')
    WHERE code = 'fanafana'
  `);
};

exports._meta = {
  version: 1,
};
