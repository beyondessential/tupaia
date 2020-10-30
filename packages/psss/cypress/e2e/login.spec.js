/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

describe('login', () => {
  it('logs in an existing multi-country user', () => {
    cy.server();
    cy.route('POST', '**auth', 'fixture:multiCountryUserAuth.json').as('auth');
    cy.login();
    cy.assertMultiCountryHome();
  });

  it('logs in an existing single-country user', () => {
    cy.server();
    cy.route('POST', '**auth', 'fixture:singleCountryUserAuth.json').as('auth');
    cy.login();
    cy.assertSingleCountryHome();
  });
});
