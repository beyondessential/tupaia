/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
export const editSurveyResponse = async (models, id, updatedFields) => {
  // If the entity or date has changed, mark all answers as changed so they resync to DHIS2 with
  // the new entity/date (no need to async/await, just set it going)
  if (updatedFields.entity_id || updatedFields.submission_time) {
    models.answer.markAsChanged({ survey_response_id: id });
  }

  return models.surveyResponse.updateById(id, updatedFields);
};
