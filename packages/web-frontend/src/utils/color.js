import { findByKey } from '.';

export const hexToRgba = (hex, opacity) => {
  const hexString = hex.replace('#', '');
  const r = parseInt(hexString.substring(0, 2), 16);
  const g = parseInt(hexString.substring(2, 4), 16);
  const b = parseInt(hexString.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};

export const getDotColorFromRange = (presentationOptions, value) => {
  const option = Object.values(presentationOptions).find(
    ({ min, max }) => value >= min && value <= max,
  );
  if (value === undefined || option === undefined) return null;
  return option;
};

const getPresentationOptionFromKey = (options, value) => findByKey(options, value, false) || null;

export const getPresentationOption = (options, value) =>
  options.type === PRESENTATION_TYPES.RANGE
    ? getPresentationOptionFromRange(options, value)
    : getPresentationOptionFromKey(options, value);
