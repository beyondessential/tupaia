/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

describe('login', () => {
  it('should login an existing user', () => {
    cy.login();
    cy.assertHome();
  });
});
