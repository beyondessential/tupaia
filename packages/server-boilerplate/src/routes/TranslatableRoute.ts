import { Request } from 'express';
import { ExpressRequest, ExpressResponse, ResBody, Route } from './Route';

type StringKey = {
  type: 'string';
};

type ObjectKey = {
  type: 'object';
  properties?: { [key: string]: TranslationKey };
  // Keys within the object to translate
  keysToTranslate?: '*' | string[];
  valuesToTranslate?: '*' | string[];
};

type ArrayKey = {
  type: 'array';
  items: TranslationKey;
  where?: (entry: any) => boolean;
};

type TranslationSchema = {
  domain: string;
  layout: TranslationKey;
};

type TranslationKey = StringKey | ObjectKey | ArrayKey;
type TranslationValue =
  | undefined
  | string
  | TranslationValue[]
  | { [key: string]: TranslationValue };

export type TranslatableResponse<Req> = {
  translate: (...args: any[]) => any;
} & ExpressResponse<Req>;

export class TranslatableRoute<
  Req extends ExpressRequest<Req> = Request,
  Res extends TranslatableResponse<Req> = TranslatableResponse<Req>
> extends Route<Req, Res> {
  protected translationSchema: TranslationSchema = {
    domain: '',
    layout: { type: 'string' },
  };

  protected respond(responseBody: ResBody<Req>, statusCode: number) {
    const translatedResponse = this.translateResponse(this.translationSchema.layout, responseBody);
    if (translatedResponse !== undefined) {
      super.respond(translatedResponse, statusCode);
    }
  }

  protected translateString(value: string): string {
    // Object notation format: "domain.key:default"
    // Find the translation for the string, or return the string itself
    // i18n doesn't allow escaping the delimiter characters, so strip them out for now
    return this.res.translate(
      `${this.translationSchema.domain}.${value.replace(/(:|\.)/g, '')}:${value}`,
    );
  }

  // Overwritable for more specific handling
  protected translateKey(value: string): string {
    return this.translateString(value);
  }

  private translateResponse(translationKey: TranslationKey, translationValue: any): any {
    if (!this.checkSchema(translationKey, translationValue)) {
      return translationValue;
    }
    switch (translationKey.type) {
      case 'string':
        return typeof translationValue === 'string'
          ? this.translateString(translationValue)
          : translationValue;
      case 'object': {
        if (typeof translationValue !== 'object') return translationValue;

        // clone for immutability
        const translatedObject = { ...translationValue } as { [key: string]: any };

        for (const [key, value] of Object.entries(translatedObject)) {
          if (
            translationKey.valuesToTranslate &&
            (translationKey.valuesToTranslate === '*' ||
              translationKey.valuesToTranslate.includes(key))
          ) {
            translatedObject[key] = typeof value === 'string' ? this.translateString(value) : value;
          } else if (translationKey.properties) {
            if (key in translationKey.properties) {
              translatedObject[key] = this.translateResponse(translationKey.properties[key], value);
            } else if ('*' in translationKey.properties) {
              // '*' is a special case key to describe all other properties
              translatedObject[key] = this.translateResponse(translationKey.properties['*'], value);
            }
          }
          if (translationKey.keysToTranslate) {
            const newKey =
              translationKey.keysToTranslate === '*' || translationKey.keysToTranslate.includes(key)
                ? this.translateKey(key)
                : key;
            if (newKey !== key) {
              translatedObject[newKey] = translatedObject[key];
              delete translatedObject[key];
            }
          }
        }
        return translatedObject;
      }
      case 'array':
        if (!Array.isArray(translationValue)) {
          return translationValue;
        }

        return translationValue.map((entry: any) =>
          !translationKey.where || translationKey.where(entry)
            ? this.translateResponse(translationKey.items, entry)
            : entry,
        );
      default:
        return translationValue;
    }
  }

  private checkSchema(translationKey: TranslationKey, translationValue: TranslationValue): boolean {
    if (!translationValue) {
      return false;
    }
    switch (translationKey.type) {
      case 'string':
        return typeof translationValue === 'string';
      case 'object':
        return typeof translationValue === 'object';
      case 'array':
        return Array.isArray(translationValue);
      default:
        return false;
    }
  }
}
