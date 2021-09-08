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
