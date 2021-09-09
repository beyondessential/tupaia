/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  loginAsSuperUser,
  openImportSurveyForm,
  enterSurveyName,
  enterCountryName,
  selectDataService,
  importSurvey,
  searchBySurveyName,
  checkSurveyByName,
  closeImportSurveyForm,
} from '../../support';

beforeEach(() => {
  loginAsSuperUser();
  openImportSurveyForm();
});
describe('import existing survey', () => {
  // Deleted Questions from Survey Demo Land - Samoa COVID-19 Contact Tracing .

  it('import an existing survey by removing questions', () => {
    enterSurveyName('Demo Land - Samoa COVID-19 Contact Tracing');
    enterCountryName('Demo Land');
    // selectDataService('DHIS');
    cy.uploadFile('surveys/Demo Land - Samoa COVID-19 Contact Tracing.xlsx');
    importSurvey();
    // assertion for confirmation message.
    cy.get('form').should('contain.text', 'Your import has been successfully processed');
    cy.get('form').contains('Done').click();
    searchBySurveyName('Demo Land - Samoa COVID-19 Contact Tracing');
    // assertion for survey search.
    checkSurveyByName('Demo Land - Samoa COVID-19 Contact Tracing');
  });

  // using 'Basic Clinic Data Demo Land' survey whose Data service is DHIS
  it('import an existing survey by changing Data Service', () => {
    enterSurveyName('Basic Clinic Data Demo Land');
    enterCountryName('Demo Land');
    selectDataService('Tupaia');
    cy.uploadFile('surveys/Basic Clinic Data Demo Land.xlsx');
    importSurvey();
    // assertion for confirmation message.
    cy.get('form').should('includes.text', 'Import failed');
    cy.get('form').contains('Dismiss').click();
    closeImportSurveyForm();
    searchBySurveyName('Basic Clinic Data Demo Land');
    // assertion for survey search.
    checkSurveyByName('Basic Clinic Data Demo Land');
  });
});
