/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
export const searchBySurveyName = surveyName => {
  cy.get('.rt-table').find('[type="text"]').eq(0).type(surveyName);
};
