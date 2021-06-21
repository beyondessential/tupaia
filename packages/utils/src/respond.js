/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Helper function to call the response res with some json
 */
export function respond(res, jsonResponse, statusCode) {
  res
    .status(statusCode || 200)
    .type('json')
    .send(JSON.stringify(jsonResponse));
}
