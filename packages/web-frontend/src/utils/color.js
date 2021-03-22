import { findByKey } from '.';

export const hexToRgba = (hex, opacity) => {
  const hexString = hex.replace('#', '');
  const r = parseInt(hexString.substring(0, 2), 16);
  const g = parseInt(hexString.substring(2, 4), 16);
  const b = parseInt(hexString.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};

/** Functions used to get matrix chart dot colors from presentation options */
const PRESENTATION_TYPES = {
  RANGE: 'range',
  CONDITION: 'condition',
  OBJECT_CONDITION: 'objectCondition',
};

const OBJECT_CONDITION_TYPE_SOME = 'some';

const CONDITION_TYPE = {
  '=': (value, filterValue) => value === filterValue,
  '>': (value, filterValue) => value > filterValue,
  '<': (value, filterValue) => value < filterValue,
  '>=': (value, filterValue) => value >= filterValue,
  '<=': (value, filterValue) => value <= filterValue,
};

const getPresentationOptionFromRange = (options, value) => {
  const option = Object.values(options).find(
    ({ min, max }) => value >= min && (max === undefined || value <= max),
  );
  if (value === undefined || value === '' || option === undefined) return null;
  return option;
};

const getPresentationOptionFromKey = (options, value) => findByKey(options, value, false) || null;

// Check if the value satisfies all the conditions if condition is an object
const satisfyAllConditions = (conditions, value, opposite) => {
  return Object.entries(conditions).every(([operator, conditionalValue]) => {
    const checkConditionMethod = CONDITION_TYPE[operator];
    if (checkConditionMethod) {
      const result = checkConditionMethod(value, conditionalValue);
      return opposite ? !result : result;
    }
    return false;
  });
};

const getPresentationOptionFromCondition = (options, value) => {
  const { conditions = [] } = options;

  const option = conditions.find(({ condition }) => {
    if (typeof condition === 'object') {
      return satisfyAllConditions(condition, value);
    }

    // If condition is not an object, assume its the value we want to check (with '=' operator)
    const checkConditionMethod = CONDITION_TYPE['='];
    return checkConditionMethod(value, condition);
  });
  return option;
};

const getPresentationOptionFromObjectCondition = (options, object) => {
  const { conditions = [] } = options;
  if (!object) return conditions.find(condition => condition.key === 'default') ?? null;

  const option = conditions.find(({ condition }) => {
    if (typeof condition === 'object') {
      // For config 'some', e.g. condition: { some: { '>': 0 } }, which checks if some elements (not all) satisfy conditions
      if (condition[OBJECT_CONDITION_TYPE_SOME]) {
        // Check at least one item meets condition, but not all
        const conditionsInSome = condition[OBJECT_CONDITION_TYPE_SOME];
        const someMeetCondition = Object.values(object).some(value =>
          satisfyAllConditions(conditionsInSome, value),
        );
        const someMeetOppositeCondition = Object.values(object).some(value =>
          satisfyAllConditions(conditionsInSome, value, true),
        );
        return someMeetCondition && someMeetOppositeCondition;
      }
      return Object.values(object).every(value => satisfyAllConditions(condition, value));
    }

    throw new Error(
      `Please specify condition as object when using 'type: ${PRESENTATION_TYPES.OBJECT_CONDITION}' in presentation config`,
    );
  });
  return option;
};

export const getPresentationOption = (options, value) => {
  switch (options.type) {
    case PRESENTATION_TYPES.RANGE:
      return getPresentationOptionFromRange(options, value);
    case PRESENTATION_TYPES.CONDITION:
      return getPresentationOptionFromCondition(options, value);
    case PRESENTATION_TYPES.OBJECT_CONDITION:
      return getPresentationOptionFromObjectCondition(options, value);
    default:
      return getPresentationOptionFromKey(options.conditions, value);
  }
};

const rgbToHsl = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l];
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  if (max === r) {
    return [((g - b) / d + (g < b ? 6 : 0)) / 6, s, l];
  }
  if (max === g) {
    return [((b - r) / d + 2) / 6, s, l];
  }
  if (max === b) {
    return [((r - g) / d + 4) / 6, s, l];
  }
  return null;
};

const hslToRgb = (h, s, l) => {
  if (s === 0) {
    return [l, l, l].map(val => Math.round(val * 255));
  }
  const hue2rgb = (p, q, t) => {
    let cleanT = t;
    if (t < 0) cleanT += 1;
    if (t > 1) cleanT -= 1;
    if (cleanT < 1 / 6) return p + (q - p) * 6 * cleanT;
    if (cleanT < 1 / 2) return q;
    if (cleanT < 2 / 3) return p + (q - p) * (2 / 3 - cleanT) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return [r, g, b].map(val => Math.round(val * 255));
};

const convertToHex = value => value.toString(16);

// Input color is hex
export const getInactiveColor = color => {
  const red = parseInt(color.substring(1, 3), 16) / 255;
  const green = parseInt(color.substring(3, 5), 16) / 255;
  const blue = parseInt(color.substring(5, 7), 16) / 255;
  const [h, s, l] = rgbToHsl(red, green, blue);
  const [r, g, b] = hslToRgb(h, s / 5, l / 2).map(convertToHex);
  return `#${r}${g}${b}`;
};
