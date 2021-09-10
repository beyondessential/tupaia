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
  checkImportSuccess,
  checkSurveyByName,
  checkImportFail,
} from '../../support';

describe('import new survey file', () => {
  beforeEach(() => {
    loginAsSuperUser();
    openImportSurveyForm();
  });
  // Check error message.
  it('Name does not match the sheet Name', () => {
    enterSurveyName('Test Wrong Survey Name');
    cy.uploadFile('surveys/Test Survey_1.xlsx');
    importSurvey();
    checkImportFail();
  });

  it('import a new survey by filling the mandatory fields', () => {
    enterSurveyName('Test Survey_1');
    cy.uploadFile('surveys/Test Survey_1.xlsx');
    importSurvey();
    checkImportSuccess();
    searchBySurveyName('Test Survey_1');

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
    checkImportSuccess();
    searchBySurveyName('Test Survey_1');
    checkSurveyByName('Test Survey_1');
  });
});
