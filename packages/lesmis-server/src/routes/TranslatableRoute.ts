/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';

// Overwrite the respond function to include a translate step
// Use translationKeys to define which pieces of the response body
// are translated for a route

export class TranslatableRoute extends Route {
  translationKeys: string[] = [];

  // TODO: use a better type
  respond(responseBody: any[], statusCode: number) {
    let translatedResponse = responseBody;
    for (const key of this.translationKeys) {
      translatedResponse = translatedResponse.map(entry => ({ ...entry, [key]: this.req.__(entry[key])}));
    }
    super.respond(translatedResponse, statusCode);
  }
}
