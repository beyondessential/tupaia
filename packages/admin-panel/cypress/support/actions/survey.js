/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

// assumption that survey names are unique
export const searchBySurveyName = surveyName => {
  cy.get('.rt-table').find('[type="text"]').eq(0).type(surveyName);
};

export const checkSurveyByName = surveyName => {
  cy.getFirstRowElementsOfTable().eq(1).should('have.text', surveyName);
};

export const checkPermissionGroup = PermissionGroup => {
  cy.getFirstRowElementsOfTable().eq(3).should('have.text', PermissionGroup);
};

export const checkSurveyGroup = surveyGroup => {
  cy.getFirstRowElementsOfTable().eq(4).should('have.text', surveyGroup);
};
