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
  // Keys within the object to translate
  keys?: 'all' | string[];
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

  translateString(value: string): string {
    // Object notation format: "domain.key:default"
    // Find the translation for the string, or return the string itself
    // i18n doesn't allow escaping the delimiter characters, so strip them out for now
    return this.res.translate(`${this.translationSchema.domain}.${value.replace(/(:|\.)/g, '')}:${value}`);
  }

  translateKey(value: string): string {
    if (value.endsWith('_metadata')) {
      const key = this.translateString(value.slice(0, -('_metadata'.length)));
      return `${key}_metadata`;
    }
    return this.translateString(value);
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
        return this.translateString(translationValue);
      case 'object': {
        let translatedObject = translationValue;
        for (const key of Object.keys(translationValue)) {
          if (key in translationKey.properties) {
            translatedObject[key] = this.translateResponse(translationKey.properties[key], translationValue[key]);
          }
          if (translationKey.keys) {
            const newKey = (translationKey.keys === 'all' || translationKey.keys.includes(key)) ? this.translateKey(key) : key;
            if (newKey !== key) {
              translatedObject[newKey] = translatedObject[key];
              delete translatedObject[key];
            }
          }
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
