'use strict';

import { insertObject } from '../utilities';

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

const CORE_RAW_DATA_REPORT_ID = 'Raw_Data_Core_Surveys';

const selectCountriesWithSpecificBcdSurvey = async db => {
  const { rows } = await db.runSql(`SELECT code FROM survey WHERE code LIKE 'BCD_%'`);
  return rows.map(({ code }) => code.split('_')[1]);
};

const selectCoreRawDataReport = async db => {
  const { rows: records } = await db.runSql(
    `SELECT * from "dashboardReport" WHERE id = '${CORE_RAW_DATA_REPORT_ID}'`,
  );
  return records[0];
};

const selectRawDataDownloadsGroupForCountry = async (db, countryCode) => {
  const { rows: records } = await db.runSql(`
      SELECT * FROM "dashboardGroup"
      WHERE name = 'Raw Data Downloads' and "organisationUnitCode" = '${countryCode}'
  `);

  return records[0];
};

const replaceCodeInSurveys = (surveys, oldCode, newCode) => {
  const newSurveys = [...surveys];
  const index = surveys.findIndex(({ code }) => code === oldCode);
  if (index === -1) {
    throw new Error(`Survey list does not include ${oldCode}`);
  }

  newSurveys[index] = { ...surveys[index], code: newCode };

  return newSurveys;
};

const getCountrySpecificRawDataReportId = countryCode => `Raw_Data_${countryCode}_Surveys`;

const replaceReportForDashboardGroup = (db, groupId, oldReportId, newReportId) =>
  db.runSql(`
    UPDATE "dashboardGroup" SET "dashboardReports" =
      array_remove("dashboardReports", '${oldReportId}')
      || '{${newReportId}}'
    WHERE id = '${groupId}'
`);

exports.up = async function (db) {
  const countryCodes = await selectCountriesWithSpecificBcdSurvey(db);
  const rawDataCoreSurveysReport = await selectCoreRawDataReport(db);
  const { id, dataBuilderConfig, drillDownLevel, ...baseReport } = rawDataCoreSurveysReport;

  for (let i = 0; i < countryCodes.length; i++) {
    const countryCode = countryCodes[i];
    const newReportId = getCountrySpecificRawDataReportId(countryCode);

    const rawDataDownloadsGroup = await selectRawDataDownloadsGroupForCountry(db, countryCode);
    if (!rawDataDownloadsGroup) {
      continue;
    }

    await insertObject(db, 'dashboardReport', {
      ...baseReport,
      id: newReportId,
      dataBuilderConfig: {
        ...dataBuilderConfig,
        surveys: replaceCodeInSurveys(dataBuilderConfig.surveys, 'BCD', `BCD_${countryCode}`),
      },
    });

    await replaceReportForDashboardGroup(
      db,
      rawDataDownloadsGroup.id,
      CORE_RAW_DATA_REPORT_ID,
      newReportId,
    );
  }
};

exports.down = async function (db) {
  const countryCodes = await selectCountriesWithSpecificBcdSurvey(db);

  for (let i = 0; i < countryCodes.length; i++) {
    const countryCode = countryCodes[i];
    const newReportId = getCountrySpecificRawDataReportId(countryCode);
    const rawDataDownloadsGroup = await selectRawDataDownloadsGroupForCountry(db, countryCode);
    if (!rawDataDownloadsGroup) {
      continue;
    }

    await db.runSql(`DELETE FROM "dashboardReport" WHERE id ='${newReportId}';`);
    await replaceReportForDashboardGroup(
      db,
      rawDataDownloadsGroup.id,
      newReportId,
      CORE_RAW_DATA_REPORT_ID,
    );
  }
};

exports._meta = {
  version: 1,
};
