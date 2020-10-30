/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

describe('login', () => {
  it('should login an existing multi-country user', () => {
    cy.server();
    cy.route('POST', '**auth', 'fixture:multiCountryUserAuth.json').as('auth');
    cy.login();
    cy.assertMultiCountryHome();
  });

  it('should login an existing single-country user', () => {
    cy.server();
    cy.route('POST', '**auth', 'fixture:singleCountryUserAuth.json').as('auth');
    cy.login();
    cy.assertSingleCountryHome();
  });
});
