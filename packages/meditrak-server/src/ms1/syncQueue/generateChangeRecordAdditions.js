/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

export async function generateChangeRecordAdditions({ models, changedRecord }) {
  try {
    // Get survey record
    const surveyResponse = await models.surveyResponse.findById(changedRecord.id);
    const survey = await surveyResponse.survey();

    // Get organisation unit
    const { code: organisationUnitCode } = await surveyResponse.fetchOrganisationUnit();

    // Store certain details for quicker sync processing
    const changeRecordDetails = {
      surveyCode: survey ? survey.code : null,
      organisationUnitCode: organisationUnitCode || null,
    };
    return {
      details: JSON.stringify(changeRecordDetails),
    };
  } catch (error) {
    throw error; // Pass error up to caller
  }
}
