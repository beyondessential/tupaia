/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

const MIN_APP_VERSION = '0.0.1';

// Required for backwards compatibility for meditrak instances
// that use clinic_id against SurveyResponse
export async function getEntityIdFromClinicId(models, clinicId) {
  if (!clinicId) {
    return null;
  }
  const clinic = await models.facility.findById(clinicId);
  const entity = await models.entity.findOne({ code: clinic.code });
  if (!entity) {
    throw new Error(`Entity could not be found for clinic with code ${clinic.code}.`);
  }

  return entity.id;
}

/**
 * Returns database types that are supported by every app version ("universal")
 *
 * @param {ModelRegistry} models
 * @returns {string[]}
 */
export const getUniversalTypes = models => {
  const minAppVersionByType = models.getMinAppVersionByType();
  return Object.keys(minAppVersionByType).filter(
    type => minAppVersionByType[type] === MIN_APP_VERSION,
  );
};

/**
 * TODO this method can be simplified and defined in the DataSource model
 * when tupaia-backlog#663 is implemented
 */
export const getDataGroupsThatIncludeElement = async (models, dataElementCode) => {
  const dataGroups = await models.database.executeSql(
    `
    SELECT ds.* FROM data_source ds
    JOIN survey s ON s.code = ds.code
    JOIN survey_screen ss ON ss.survey_id = s.id
    JOIN survey_screen_component ssc ON ssc.screen_id = ss.id
    JOIN question q ON q.id = ssc.question_id
    WHERE q.code = ? AND ds.type = 'dataGroup'
  `,
    [dataElementCode],
  );

  return Promise.all(dataGroups.map(models.dataSource.generateInstance));
};
