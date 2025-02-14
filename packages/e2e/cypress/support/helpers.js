/**
 * Preserve user session cookies, which are set during log in
 *
 * @see https://docs.cypress.io/api/cypress-api/cookies.html#Preserve-Once
 */
export const preserveUserSession = () => Cypress.Cookies.preserveOnce('sessionV2');
