/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
describe('weekly reports', () => {
  it('can navigate to weekly reports panel', () => {
    // set up route stubs. we don't want to retest login functionality as that is covered by the login test
    cy.server();
    cy.route('POST', '**login', 'fixture:multiCountryUserAuth.json').as('login');

    cy.login();
    cy.assertMultiCountryHome();

    // select country
    cy.findByTestId('countries-table').within(() => {
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
    cy.findByText(/upcoming report*/i).should('exist');
    cy.findByText(/submit now*/i).should('exist');
  });
});
