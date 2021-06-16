/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Helper function to call the response res with some json
 */
export function respond(res, responseBody, statusCode) {
  // we allow a "overrideRespond" function to be attached to `res`, so that we can change the
  // response mechanism in certain situations
  // motivating use case: if an import process will take too long, we email them the response rather
  // than respond directly to the original http query
  const { overrideRespond } = res;
  if (overrideRespond) {
    return overrideRespond(responseBody, statusCode);
  }
  return res
    .status(statusCode || 200)
    .type('json')
    .send(JSON.stringify(responseBody));
}
