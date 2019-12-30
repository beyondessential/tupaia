/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { get } from 'lodash';

// Store certain details for faster sync processing
export async function generateChangeRecordAdditions({ models, recordType, changedRecord }) {
  try {
    if (recordType === models.entity.databaseType) {
      return generateEntityRecordAdditions(changedRecord);
    }
    // Get the survey response
    const isAnswer = recordType === models.answer.databaseType;
    const surveyResponseId = isAnswer ? changedRecord.survey_response_id : changedRecord.id;
    const surveyResponse = await models.surveyResponse.findById(surveyResponseId);

    // Check whether to use the regional or a country specific dhis2 instance
    const survey = surveyResponse && (await surveyResponse.survey());
    const isDataRegional = survey ? survey.getIsDataForRegionalDhis2() : null;

    // Get the organisation unit code
    const { code: organisationUnitCode } = surveyResponse
      ? await surveyResponse.fetchOrganisationUnit()
      : { code: null };

    return { details: JSON.stringify({ isDataRegional, organisationUnitCode }) };
  } catch (error) {
    throw error; // Pass error up to caller
  }
}

const generateEntityRecordAdditions = changedRecord => {
  const isDataRegional = get(changedRecord, 'metadata.dhis.isDataRegional', true);

  return {
    details: { isDataRegional, organisationUnitCode: changedRecord.country_code },
  };
};
