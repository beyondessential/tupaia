/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useUrlParams } from '../utils';
import { translations } from '../constants/translations';
import { DEFAULT_LOCALE } from '../constants';

const MISSING_TEXT = 'Translation could not be found';

const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const dig = (obj, keys) => {
  if (!obj) {
    return null;
  }

  const [first, ...rest] = keys;

  if (rest.length === 0) {
    if (hasKey(obj, first)) {
      return obj[first];
    }

    return null;
  }

  if (hasKey(obj, first)) {
    return dig(obj[first], rest);
  }

  return null;
};

const getTranslation = (locale, t) => {
  const splitT = t.split('.');

  if (hasKey(translations, locale)) {
    const translation = dig(translations[locale], splitT);

    if (translation !== null) {
      return translation;
    }
  }

  const defaultTranslation = dig(translations[DEFAULT_LOCALE], splitT);

  if (defaultTranslation !== null) {
    return defaultTranslation;
  }

  return null;
};

export const I18n = ({ t, children }) => {
  const { locale } = useUrlParams();
  const translation = getTranslation(locale, t);

  if (translation) {
    return translation;
  }

  if (children !== undefined) {
    return children;
  }

  return MISSING_TEXT;
};
