/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import { useUrlParams } from '../utils';
import { translations } from '../constants/translations';
import { DEFAULT_LOCALE } from '../constants';

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

  if (translations.hasOwnProperty(locale)) {
    const translation = dig(translations[locale], splitT);

    if (typeof translation === 'string') {
      return translation;
    }
  }

  const defaultTranslation = dig(translations[DEFAULT_LOCALE], splitT);

  if (typeof defaultTranslation === 'string') {
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

  if (children) {
    return children;
  }

  return null;
};

I18n.propTypes = {
  t: PropTypes.string,
  children: PropTypes.node,
};

I18n.defaultProps = {
  missingText: null,
};
