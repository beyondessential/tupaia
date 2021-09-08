/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  loginAsSuperUser,
  openImportSurveyForm,
  enterSurveyName,
  enterCountryName,
  enterPermissionGroup,
  enterSurveyGroup,
  selectReportingPeriod,
  selectDataService,
  importSurvey,
  searchBySurveyName,
  closeImportSurveyForm,
  checkSurveyByName,
} from '../../support';

beforeEach(() => {
  loginAsSuperUser();
  openImportSurveyForm();
});

describe('import new survey file', () => {
  // Check error message.
  it('Name does not match the sheet Name', () => {
    enterSurveyName('Test Wrong Survey Name');
    cy.uploadFile('surveys/Test Survey_1.xlsx');
    importSurvey();
    // assertion for error message.
    cy.get('form').should('includes.text', 'Import failed');
    cy.get('form').contains('Dismiss').click();
    closeImportSurveyForm();
  });

  it('import a new survey by filling the mandatory fields', () => {
    enterSurveyName('Test Survey_1');
    cy.uploadFile('surveys/Test Survey_1.xlsx');
    importSurvey();
    // assertion for confirmation message.
    cy.get('form').should('contain.text', 'Your import has been successfully processed');
    cy.get('form').contains('Done').click();
    searchBySurveyName('Test Survey_1');
    // assertion for survey search.
    checkSurveyByName('Test Survey_1');
  });

  it('import a new survey by filling all the fields', () => {
    enterSurveyName('Test Survey_1');
    enterCountryName('Demo Land');
    enterPermissionGroup('Admin');
    enterSurveyGroup('Baseline Surveys');
    selectReportingPeriod('Weekly');
    selectDataService('Tupaia');
    cy.uploadFile('surveys/Test Survey_1.xlsx');
    importSurvey();
    // assertion for confirmation message.
    cy.get('form').should('contain.text', 'Your import has been successfully processed');
    cy.get('form').contains('Done').click();
    searchBySurveyName('Test Survey_1');
    // assertion for survey search.
    checkSurveyByName('Test Survey_1');
  });
});
