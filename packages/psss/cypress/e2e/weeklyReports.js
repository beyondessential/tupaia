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
    cy.findAllByTestId('country-link').first().click();

    cy.assertWeeklyReportsPage();

    // expand table row
    cy.findAllByTestId('active-country-link').first().click();

    // open panel
    cy.findAllByTestId('review-confirm-button').first().click();
    cy.findByText(/submit now*/i).should('exist');
  });
});
