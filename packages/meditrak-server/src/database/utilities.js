/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { MIN_VERSION } from '../utilities/version';

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
  return Object.keys(minAppVersionByType).filter(type => minAppVersionByType[type] === MIN_VERSION);
};
