/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Helper function to call the response res with some json
 */
export function respond(res, responseBody, statusCode) {
  // in some cases we set up a "sendResponseAsEmail" function to allow feedback to the user after
  // the request has already responded, e.g. if the full response will take too long, we might
  // respond to tell the user the results will be emailed, and this subsequent response will send
  // that email
  const { sendResponseAsEmail } = res;
  if (sendResponseAsEmail) {
    return sendResponseAsEmail(responseBody, statusCode);
  }
  return res
    .status(statusCode || 200)
    .type('json')
    .send(JSON.stringify(responseBody));
}
