/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const hexToRgba = (hex, opacity) => {
  let hexString = hex.replace('#', '');
  // If the hex is shortened, double up each character. This is for cases like '#fff'
  const isShortened = hexString.length === 3;
  if (isShortened) hexString = hexString.replace(/(.)/g, '$1$1');
  const r = parseInt(hexString.substring(0, 2), 16);
  const g = parseInt(hexString.substring(2, 4), 16);
  const b = parseInt(hexString.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};
