/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  loginAsSuperUser,
  openImportSurveyForm,
  importSurvey,
  searchBySurveyName,
  checkImportSuccess,
  checkSurveyByName,
  checkImportFail,
  fillSurveyImportForm,
} from '../../support';

describe('import new survey file', () => {
  beforeEach(() => {
    loginAsSuperUser();
    openImportSurveyForm();
  });
  // Check error message.
  it('Name does not match the sheet Name', () => {
    it('import a new survey by filling all the fields', () => {
      fillSurveyImportForm({
        surveyNames: ['Test Wrong Survey Name'],
      });   
    cy.uploadFile('surveys/Test Survey_1.xlsx');
    importSurvey();
    checkImportFail();
  });

  it('import a new survey by filling the mandatory fields', () => {

    it('import a new survey by filling all the fields', () => {
      fillSurveyImportForm({
        surveyNames: ['Test Survey_1'],
      });
    cy.uploadFile('surveys/Test Survey_1.xlsx');
    importSurvey();
    checkImportSuccess();
    searchBySurveyName('Test Survey_1');
    checkSurveyByName('Test Survey_1');
  });

  it.only('import a new survey by filling all the fields', () => {
    fillSurveyImportForm({
      surveyNames: ['Test Survey_1', 'Test Survey_15'],
      countries: ['Demo Land', 'Kiribati', 'Australia'],
      permissionGroup: 'Admin',
      surveyGroup: 'Baseline Surveys',
      reportingPeriod: 'Weekly',
      dataService: 'Tupaia',
    });
    cy.uploadFile('surveys/Test Survey_1.xlsx');
    importSurvey();
    checkImportSuccess();
    searchBySurveyName('Test Survey_1');
    checkSurveyByName('Test Survey_1');
  });
});