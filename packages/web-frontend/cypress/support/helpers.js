/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Preserve user session cookies, which are set during log in
 *
 * @see https://docs.cypress.io/api/cypress-api/cookies.html#Preserve-Once
 */
export const preserveUserSession = () => Cypress.Cookies.preserveOnce('sessionV2');
