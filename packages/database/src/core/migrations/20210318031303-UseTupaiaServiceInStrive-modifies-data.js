'use strict';

import { arrayToDbString } from '../utilities';

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

const ENTITY_AGGREGATION_CONFIG = {
  reports: {
    PG_Strive_PNG_Weekly_Febrile_Cases_By_Village: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'village',
    },
    PG_Strive_PNG_Weekly_Number_of_Febrile_Cases: { dataSourceEntityType: 'case' },
    PG_Strive_PNG_Weekly_Reported_Cases: { dataSourceEntityType: 'case' },
    PG_Strive_PNG_RDT_Tests_Total_And_Percent_Positive: { dataSourceEntityType: 'facility' },
    PG_Strive_PNG_Weekly_Percentage_of_Positive_Consultations: { dataSourceEntityType: 'facility' },
    PG_Strive_PNG_Weekly_Number_of_Consultations: { dataSourceEntityType: 'facility' },
    PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations: {
      dataSourceEntityType: 'facility',
    },
    PG_Strive_PNG_Febrile_Cases_By_Age: { dataSourceEntityType: 'case' },
    PG_Strive_PNG_Febrile_Cases_By_Sex: { dataSourceEntityType: 'case' },
    PG_Strive_PNG_Febrile_Cases_By_Week: { dataSourceEntityType: 'case' },
    PG_Strive_PNG_Case_Report_Form_Export: { dataSourceEntityType: 'case' },
    PG_Strive_PNG_Weekly_Febrile_Illness_RDT_Positive_By_Facility_National: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'village',
    },
    PG_Strive_PNG_Weekly_mRDT_Positive: { dataSourceEntityType: 'case' },
    PG_Strive_PNG_Positive_RDT_By_Result_Over_Time: { dataSourceEntityType: 'case' },
    PG_Strive_PNG_K13_PCR_Results: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    SCRF_RDT_Positive_Results: { dataSourceEntityType: 'case' },
  },
  overlays: {
    PG_STRIVE_K13_C580Y_Positive_Count: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    PG_STRIVE_K13_C580Y_Positive: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    PG_STRIVE_PF05_Positive: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    PG_STRIVE_PM05_Positive: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    PG_STRIVE_PO05_Positive: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    PG_STRIVE_PV05_Positive: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    PG_STRIVE_QMAL05_Positive: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    STRIVE_CRF_Febrile_Cases_Radius: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    STRIVE_CRF_mRDT_Tests_Radius: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    STRIVE_CRF_Positive_Mixed_Percentage: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    STRIVE_CRF_Positive_Non_Pf_Percentage: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    STRIVE_CRF_Positive_Pf_Percentage: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    STRIVE_CRF_Positive: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
    },
    STRIVE_FIS_Village_Number_Reported_Cases_In_Week: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'village',
    },
    STRIVE_FIS_Village_Percent_mRDT_Positive_In_Week: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'village',
    },
    STRIVE_FIS_Village_Percent_mRDT_Positive_Mixed_In_Week: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'village',
    },
    STRIVE_FIS_Village_Percent_mRDT_Positive_Non_PF_In_Week: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'village',
    },
    STRIVE_FIS_Village_Percent_mRDT_Positive_PF_In_Week: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'village',
    },
    STRIVE_WTF_Consultations_Radius: { dataSourceEntityType: 'facility' },
    STRIVE_WTF_mRDT_Tests_Radius: { dataSourceEntityType: 'facility' },
    STRIVE_WTF_Positive: { dataSourceEntityType: 'facility' },
  },
};

const deleteDhisSyncTableAnswers = async (db, table, surveyCodes) =>
  db.runSql(`
    DELETE FROM ${table} dst
    USING answer a, survey_response sr, survey s
    WHERE
      dst.record_type = 'answer' AND
      dst.record_id = a.id AND
      a.survey_response_id = sr.id AND
      sr.survey_id = s.id AND
      s.code in (${arrayToDbString(surveyCodes)});
`);

const deleteDhisSyncTableResponses = async (db, table, surveyCodes) =>
  db.runSql(`
    DELETE FROM ${table} dst
    USING survey_response sr, survey s
    WHERE
      dst.record_type = 'survey_response' AND
      dst.record_id = sr.id AND
      sr.survey_id = s.id AND
      s.code in (${arrayToDbString(surveyCodes)})`);

/**
 * @param {Record<string, string>} object = mutaeed
 */
const addEntityAggregationFields = (object, newFields) => {
  // eslint-disable-next-line no-param-reassign
  object.entityAggregation = { ...object.entityAggregation, ...newFields };
};

/**
 * Handles both dashboard reports and map overlays
 */
const updateVisualisation = async (db, table, id, entityAggregation) => {
  if (!['dashboardReport', 'mapOverlay'].includes(table)) {
    throw new Error(`Invalid visualisation table: ${table}`);
  }
  const builderKey = table === 'dashboardReport' ? 'dataBuilder' : 'measureBuilder';
  const configKey = `${builderKey}Config`;

  const composedBuilders = [
    'composeDataPerOrgUnit',
    'composeDataPerPeriod',
    'composePercentagePerOrgUnit',
  ];

  const {
    rows: [vis],
  } = await db.runSql(`SELECT * FROM "${table}" WHERE id = '${id}'`);
  if (composedBuilders.includes(vis[builderKey])) {
    // Update nested configs
    Object.values(vis[configKey][`${builderKey}s`]).forEach(builder => {
      addEntityAggregationFields(builder[configKey], entityAggregation);
    });
  } else {
    addEntityAggregationFields(vis[configKey], entityAggregation);
  }

  const config = vis[configKey];
  await db.runSql(
    `UPDATE "${table}" SET "${configKey}" = '${JSON.stringify(config)}' WHERE id ='${id}'`,
  );
};

const updateVisualisationsInTable = async (db, entityAggregationByVisId, table) =>
  Promise.all(
    Object.entries(entityAggregationByVisId).map(([id, entityAggregation]) =>
      updateVisualisation(db, table, id, entityAggregation),
    ),
  );

const setDataElementServiceToTupaiaForSurveys = async (db, surveyCodes) =>
  db.runSql(`
    UPDATE data_source de SET service_type = 'tupaia', config = '{}'
    FROM data_element_data_group dedg
    JOIN survey s ON s.data_source_id = dedg.data_group_id
    WHERE
      dedg.data_element_id = de.id AND
      s.code IN (${arrayToDbString(surveyCodes)})`);

const setDataGroupServiceToTupaiaForSurveys = async (db, surveyCodes) => {
  await db.runSql(`
    UPDATE data_source ds SET service_type = 'tupaia', config = '{}'
    FROM survey s
    WHERE
      s.data_source_id = ds.id AND
      s.code IN (${arrayToDbString(surveyCodes)})`);

  await db.runSql(
    `DELETE FROM data_source WHERE type = 'dataElement' AND code IN(${arrayToDbString(
      surveyCodes.map(code => `${code}SurveyDate`),
    )})`,
  );
};

const checkCanUpdateElementsInSurveys = async (db, surveys) => {
  // Select elements that are shared with surveys other than the ones we will be converting here
  const { rows: sharedElements } = await db.runSql(`
    SELECT de.code as data_element, s2.code as survey FROM data_element_data_group dedg
    JOIN survey s ON s.data_source_id = dedg.data_group_id
    JOIN data_element_data_group dedg2 ON dedg2.id <> dedg.id AND dedg2.data_element_id = dedg.data_element_id
    JOIN survey s2 ON s2.data_source_id = dedg2.data_group_id
    JOIN data_source de ON de.id = dedg.data_element_id
    WHERE
      s.code IN (${arrayToDbString(surveys)}) AND
      s2.code NOT IN (${arrayToDbString(surveys)})
    `);

  if (sharedElements.length > 0) {
    // Although we could convert those shared elements, we throw an error to avoid
    // unintended side effects in other areas of the app
    throw new Error(
      [
        `Cannot convert the following data sources to the 'tupaia' service`,
        `They are shared by other surveys which will not be converted here:`,
        sharedElements,
      ].join('\n'),
    );
  }
};

const selectStriveSurveyCodes = async db => {
  const { rows } = await db.runSql(`
    SELECT code FROM survey s
    JOIN permission_group pg ON pg.id = s.permission_group_id
    WHERE pg.name ILIKE 'Strive%';`);
  return rows.map(r => r.code);
};

exports.up = async function (db) {
  const surveyCodes = await selectStriveSurveyCodes(db);

  await checkCanUpdateElementsInSurveys(db, surveyCodes);
  await setDataGroupServiceToTupaiaForSurveys(db, surveyCodes);
  await setDataElementServiceToTupaiaForSurveys(db, surveyCodes);

  await updateVisualisationsInTable(db, ENTITY_AGGREGATION_CONFIG.reports, 'dashboardReport');
  await updateVisualisationsInTable(db, ENTITY_AGGREGATION_CONFIG.overlays, 'mapOverlay');

  await deleteDhisSyncTableResponses(db, 'dhis_sync_queue', surveyCodes);
  await deleteDhisSyncTableResponses(db, 'dhis_sync_log', surveyCodes);
  await deleteDhisSyncTableAnswers(db, 'dhis_sync_queue', surveyCodes);
  await deleteDhisSyncTableAnswers(db, 'dhis_sync_log', surveyCodes);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
