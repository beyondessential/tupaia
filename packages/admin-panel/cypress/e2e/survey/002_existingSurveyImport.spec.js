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
  checkPermissionGroup,
  enterPermissionGroup,
  checkSurveyGroup,
  enterSurveyGroup,
  checkImportSuccess,
  checkImportFail,
} from '../../support';

describe('import existing survey', () => {
  beforeEach(() => {
    loginAsSuperUser();
    openImportSurveyForm();
  });
  // Deleted Questions from Survey Demo Land - Samoa COVID-19 Contact Tracing .

  it('import an existing survey by removing questions', () => {
    enterSurveyName('Demo Land - Samoa COVID-19 Contact Tracing');
    enterCountryName('Demo Land');
    cy.uploadFile('surveys/Demo Land - Samoa COVID-19 Contact Tracing.xlsx');
    importSurvey();
    checkImportSuccess();
    searchBySurveyName('Demo Land - Samoa COVID-19 Contact Tracing');
    checkSurveyByName('Demo Land - Samoa COVID-19 Contact Tracing');
  });

  // original permission group for Basic Clinic Data Demo Land is Public
  it('import an existing with a different permission group', () => {
    enterSurveyName('Basic Clinic Data Demo Land');
    enterCountryName('Demo Land');
    enterPermissionGroup('Admin');
    selectDataService('DHIS');
    cy.uploadFile('surveys/Basic Clinic Data Demo Land.xlsx');
    importSurvey();
    checkImportSuccess();
    searchBySurveyName('Basic Clinic Data Demo Land');
    checkSurveyByName('Basic Clinic Data Demo Land');
    checkPermissionGroup('Admin');
  });

  // No pre-existing Survey group for Basic Clinic Data Demo Land
  it('import an existing survey with a different Survey group', () => {
    enterSurveyName('Basic Clinic Data Demo Land');
    enterCountryName('Demo Land');
    enterSurveyGroup('Baseline Surveys');
    selectDataService('DHIS');
    cy.uploadFile('surveys/Basic Clinic Data Demo Land.xlsx');
    importSurvey();
    checkImportSuccess();
    searchBySurveyName('Basic Clinic Data Demo Land');
    checkSurveyByName('Basic Clinic Data Demo Land');
    checkSurveyGroup('Baseline Surveys');
  });

  // using 'Basic Clinic Data Demo Land' survey whose Data service is DHIS
  it('import an existing survey by changing Data Service', () => {
    enterSurveyName('Basic Clinic Data Demo Land');
    enterCountryName('Demo Land');
    selectDataService('Tupaia');
    cy.uploadFile('surveys/Basic Clinic Data Demo Land.xlsx');
    importSurvey();
    checkImportFail();
    searchBySurveyName('Basic Clinic Data Demo Land');
    checkSurveyByName('Basic Clinic Data Demo Land');
  });
});
