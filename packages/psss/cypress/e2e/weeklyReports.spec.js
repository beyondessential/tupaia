/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
describe('weekly reports', () => {
  it('can navigate to weekly reports panel', () => {
    // set up route stubs. we don't want to retest login functionality as that is covered by the login test
    cy.server();
    cy.loginTestUser2();
    cy.assertMultiCountryHome();

    // select country
    cy.findByTestId('countries-table').within(() => {
      // eslint-disable-next-line cypress/no-force
      cy.findAllByRole('link').first().click({ force: true }); // https://github.com/cypress-io/cypress/issues/7306
    });

    cy.assertWeeklyReportsPage();

    // expand table row
    cy.findByTestId('country-table').within(() => {
      cy.findAllByRole('row', { name: /week*/i }).first().click();
    });

    // open panel
    cy.findAllByRole('button', { name: /review and confirm*/i })
      .first()
      .click();

    // check that the panel is correctly rendered
    cy.findByTestId('weekly-reports-panel').within(() => {
      cy.findByText(/tonga*/i).should('exist');
      cy.findByText(/week 03*/i).should('exist');
      cy.findByText(/jan 24*/i).should('exist');
      cy.findByText(/jan 18*/i).should('exist');
      cy.findByText(/upcoming report*/i).should('exist');
      cy.findByText(/confirm now*/i).should('exist');
    });
  });
});
