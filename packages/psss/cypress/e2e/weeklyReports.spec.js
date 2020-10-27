/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
describe('weekly reports', () => {
  it('can navigate to weekly reports panel', () => {
    // set up route stubs. we don't want to retest login functionality as that is covered by the login test
    cy.server();
    cy.route('POST', '**auth', 'fixture:auth.json').as('auth');

    cy.login();
    cy.assertHome();

    // select country
    cy.findByTestId('countries-table').within(() => {
      cy.findAllByRole('link').first().click();
    });

    cy.assertWeeklyReportsPage();

    // expand table row
    cy.findByTestId('country-table').within(() => {
      cy.findAllByRole('row', { name: /week*/i }).first().click();
    });

    // open panel
    cy.findByRole('button', { name: /review and confirm*/i }).click();

    // check that the panel is correctly rendered
    cy.findByText(/upcoming report*/i).should('exist');
    cy.findByText(/submit now*/i).should('exist');
  });
});
