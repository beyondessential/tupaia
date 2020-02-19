/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class Ms1ChangeDetailGenerator {
  generateDetails = async updateChanges => {
    return Promise.all(
      updateChanges.map(async change => {
        // Get survey record
        const surveyResponse = await this.models.surveyResponse.findById(change.record_id);
        const survey = await surveyResponse.survey();

        // Get organisation unit
        const { code: organisationUnitCode } = await surveyResponse.fetchOrganisationUnit();

        // Store certain details for quicker sync processing
        const changeRecordDetails = {
          surveyCode: survey ? survey.code : null,
          organisationUnitCode: organisationUnitCode || null,
        };
        return JSON.stringify(changeRecordDetails);
      }),
    );
  };
}
