/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import 'cypress-file-upload';

export const openImportSurveyForm = () => {
  cy.findByText('Import').click();
};

export const enterSurveyName = surveyName => {
  cy.selectIntoTextBox('Survey Names', surveyName);
};

export const enterCountryName = country => {
  cy.selectIntoTextBox('Countries', country);
};

export const enterPermissionGroup = permission => {
  cy.selectIntoTextBox('Permission Group', permission);
};

export const enterSurveyGroup = surveyGroup => {
  cy.selectIntoTextBox('Survey Group', surveyGroup);
};

export const selectReportingPeriod = reportingPeriod => {
  cy.selectDropDownValue('Reporting Period', 'Please select', reportingPeriod);
};
export const selectDataService = dataService => {
  cy.selectDropDownValue('Data service', 'Please select', dataService);
};
export const importSurvey = () => {
  cy.get('[type="submit"]').click();
};
