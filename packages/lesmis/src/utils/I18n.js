import PropTypes from 'prop-types';
import { useUrlParams } from './useUrlParams';
import { DEFAULT_LOCALE } from '../constants';
import { en, lo } from '../translations';

const TRANSLATIONS = {
  en,
  lo,
};

const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

/**
 * Recursive lookup function of the translation value in the translations object
 * @param obj {object}
 * @param keys {array}
 * @returns {null|*}
 */
const lookupTranslationByKey = (obj, keys) => {
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
    return lookupTranslationByKey(obj[first], rest);
  }

  return null;
};

/**
 * Gets the correct translation value for the given t
 * @param {string} locale - I18n locale code
 * @param {string} t - the lookup key for the translation. Can be a dotted string to lookup nested
 * objects in the translations eg. homePage.about
 * @returns {null|string}
 */
const getTranslation = (locale, t) => {
  const splitT = t.split('.');

  if (hasKey(TRANSLATIONS, locale)) {
    const translation = lookupTranslationByKey(TRANSLATIONS[locale], splitT);

    if (typeof translation === 'string') {
      return translation;
    }
  }

  const defaultTranslation = lookupTranslationByKey(TRANSLATIONS[DEFAULT_LOCALE], splitT);

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

export const useI18n = () => {
  const { locale } = useUrlParams();

  const translate = t => {
    const translation = getTranslation(locale, t);
    if (translation) {
      return translation;
    }
    return null;
  };

  const getProfileLabel = entityType => {
    if (!entityType) {
      return 'Profile';
    }
    switch (entityType) {
      case 'country':
        return translate('dashboards.countryProfile');
      case 'district':
        return translate('dashboards.provinceProfile');
      case 'sub_district':
        return translate('dashboards.districtProfile');
      case 'school':
        return translate('dashboards.schoolProfile');
      default:
        return `${entityType} Profile`;
    }
  };

  return { translate, getProfileLabel };
};
