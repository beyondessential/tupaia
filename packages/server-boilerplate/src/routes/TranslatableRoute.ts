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
  properties?: { [key: string]: TranslationKey };
  // Keys within the object to translate
  keysToTranslate?: '*' | string[];
  valuesToTranslate?: '*' | string[];
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

  // Overwritable for more specific handling
  translateKey(value: string): string {
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
          if (translationKey.valuesToTranslate && (translationKey.valuesToTranslate === '*' || translationKey.valuesToTranslate.includes(key))) {
            // valuesToTranslate should always be strings
            translatedObject[key] = this.translateString(translationValue[key]);
          } else if (translationKey.properties) {
            if (key in translationKey.properties) {
              translatedObject[key] = this.translateResponse(translationKey.properties[key], translationValue[key]);
            } else if ('*' in translationKey.properties) {
              // '*' is a special case key to describe all other properties
              translatedObject[key] = this.translateResponse(translationKey.properties['*'], translationValue[key]);
            }
          }
          if (translationKey.keysToTranslate) {
            const newKey = (translationKey.keysToTranslate === '*' || translationKey.keysToTranslate.includes(key)) ? this.translateKey(key) : key;
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
