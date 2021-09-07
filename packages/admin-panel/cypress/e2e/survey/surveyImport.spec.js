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
} from '../../support';

describe('import survey file', () => {
  before(() => {
    loginAsSuperUser();
  });

  it('import a single survey to a single country', () => {
    openImportSurveyForm();
    enterSurveyName('Test Survey_1');
    enterCountryName('Demo Land');
    enterPermissionGroup('Admin');
    enterSurveyGroup('Baseline Surveys');
    selectReportingPeriod('Weekly');
    selectDataService('Tupaia');
    cy.uploadFile('surveys/Test Survey_1.xlsx');
    importSurvey();
    cy.get('form').should('contain.text', 'Your import has been successfully processed');
    cy.get('form').contains('Done').click();
    searchBySurveyName('Test Survey_1');
    cy.FirstRowElementOfTable().eq(1).should('have.text', 'Test Survey_1');
  });
});
