/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';

// Overwrite the respond function to include a translate step
// Use translationKeys to define which pieces of the response body
// are translated for a route

type StringKey = {
  type: 'string';
}

type ObjectKey = {
  type: 'object';
  properties: { [key: string]: TranslationKey };
}

type ArrayKey = {
  type: 'array';
  items: TranslationKey;
}

type EmptyKey = {
  type: 'empty';
}

type TranslationKey = StringKey | ObjectKey | ArrayKey | EmptyKey;

export class TranslatableRoute extends Route {
  translationKeys: TranslationKey = { type: 'empty' };

  // TODO: use a better type
  respond(responseBody: any[], statusCode: number) {
    const translatedResponse = this.translateResponse(this.translationKeys, responseBody);
    super.respond(translatedResponse, statusCode);
  }

  translateResponse(translationKey: TranslationKey, translationValue: any) {
    switch(translationKey.type) {
      case 'string':
        return this.res.__(translationValue);
      case 'object': {
        let translatedObject = translationValue;
        for (const key of Object.keys(translationKey.properties)) {
          translatedObject[key] = this.translateResponse(translationKey.properties[key], translationValue[key]);
        }
        return translatedObject;
      }
      case 'array':
        return translationValue.map(entry => this.translateResponse(translationKey.items, entry));
      default:
        return translationValue;
    }
  }

}
