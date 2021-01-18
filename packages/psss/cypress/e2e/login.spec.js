/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

describe('login', () => {
  it('logs in an existing multi-country user', () => {
    cy.server();
    cy.route('POST', '**login', 'fixture:multiCountryUserAuth.json').as('login');
    cy.login();
    cy.assertMultiCountryHome();
  });

  it('logs in an existing single-country user', () => {
    cy.server();
    cy.route('POST', '**login', 'fixture:singleCountryUserAuth.json').as('login');
    cy.login();
    cy.assertSingleCountryHome();
  });
});
