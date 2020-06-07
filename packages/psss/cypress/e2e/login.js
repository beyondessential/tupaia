/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

describe('login', () => {
  it('can login', () => {
    const user = {
      username: 'caigertom@gmail.com',
      password: 'Pinkie3235',
    };
    cy.visit('/');
    cy.findByPlaceholderText(/email/i).type(user.username);
    cy.findByPlaceholderText(/password/i).type(user.password);
    cy.findByText(/login*/i)
      .closest('button')
      .click();
  });
});
