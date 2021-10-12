/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';

const i18n = require('i18n')

// Overwrite the respond function to include a translate step
// Use translationKeys to define which pieces of the response body
// are translated for a route

export class TranslatableRoute extends Route {
  translationKeys: string[] = [];

  // TODO: use a better type
  respond(responseBody: any[], statusCode: number) {
    const { locale } = this.req.query;
    if (locale) {
      i18n.setLocale(locale);
    }
    let translatedResponse = responseBody;
    for (const key of this.translationKeys) {
      translatedResponse = translatedResponse.map(entry => ({ ...entry, [key]: i18n.__(entry[key])}));
    }
    super.respond(translatedResponse, statusCode);
  }
}
