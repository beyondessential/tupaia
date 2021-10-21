/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { NextFunction } from 'express';
import { Route } from './Route';

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
  where?: (entry: any) => boolean;
}

type TranslationSchema = {
  domain: string;
  layout: TranslationKey;
}

type TranslationKey = StringKey | ObjectKey | ArrayKey;
type TranslationValue = undefined | string | TranslationValue[] | { [key: string]: TranslationValue };

export class TranslatableRoute extends Route {
  translationSchema: TranslationSchema = {
    domain: '',
    layout: { type: 'string' }
  }

  respond(responseBody: TranslationValue, statusCode: number) {
    const translatedResponse = this.translateResponse(this.translationSchema.layout, responseBody);
    super.respond(translatedResponse, statusCode);
  }

  // Overload this function so that translationKey implies the shape of translationValue
  translateResponse(translationKey: StringKey, translationValue: string): TranslationValue;
  translateResponse(translationKey: ObjectKey, translationValue: { [key: string]: TranslationValue }): TranslationValue;
  translateResponse(translationKey: ArrayKey, translationValue: TranslationValue[]): TranslationValue;
  translateResponse(translationKey: TranslationKey, translationValue: TranslationValue): TranslationValue;
  translateResponse(translationKey: any, translationValue: any): any {
    if (!translationValue) {
      return undefined;
    }
    switch(translationKey.type) {
      case 'string':
        // Object notation format: "domain.key:default"
        // Find the translation for the string, or return the string itself
        return this.res.translate(`${this.translationSchema.domain}.${translationValue}:${translationValue}`);
      case 'object': {
        let translatedObject = translationValue;
        for (const key of Object.keys(translationKey.properties)) {
          translatedObject[key] = this.translateResponse(translationKey.properties[key], translationValue[key]);
        }
        return translatedObject;
      }
      case 'array':
        return translationValue.map((entry: TranslationValue) => (!translationKey.where || translationKey.where(entry)) ? this.translateResponse(translationKey.items, entry) : entry);
      default:
        return translationValue;
    }
  }

}
