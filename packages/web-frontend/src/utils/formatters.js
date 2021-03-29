/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import numeral from 'numeral';
import PositiveIcon from '@material-ui/icons/CheckCircle';
import NegativeIcon from '@material-ui/icons/Cancel';

import { VALUE_TYPES } from '../components/View/constants';
import { VIEW_STYLES, BLUE, GREY } from '../styles';

/**
 *
 * @param {string|number} number number to truncate
 * @param {string|number} decimalPlace how many decimal places to truncate number to
 */
const truncateDecimalToPlace = decimalPlace => number => {
  const place = 10 ** decimalPlace;
  return Math.floor(number * place) / place;
};

// Note: will display 0 if passed undefined
const currency = value => numeral(value).format('$0.00a');

const fraction = (value, { total }) => {
  if (isNaN(total)) return 'No data';
  return `${String(value)}/${String(total)}`;
};

const fractionAndPercentage = (value, { numerator, denominator }) => {
  if (isNaN(value)) return value;
  return `${numerator}/${denominator} = ${percentage(value)}`;
};

const numberAndPercentage = (value, { numerator, denominator }) => {
  if (isNaN(value)) return value;
  return `${value} (${percentage(numerator / denominator)})`;
};

const text = value => String(value);

const boolean = (value, { presentationOptions = {} }) => {
  const isPositive = value > 0;
  const Icon = isPositive ? PositiveIcon : NegativeIcon;
  const colorKey = isPositive ? 'yes' : 'no';
  const defaultColors = { yes: BLUE, no: GREY };
  const color = presentationOptions[colorKey]
    ? presentationOptions[colorKey].color
    : defaultColors[colorKey];
  const iconStyle = {
    ...VIEW_STYLES.icon,
    color,
  };
  return (
    <div style={VIEW_STYLES.tickContainer}>
      <Icon style={iconStyle} />
    </div>
  );
};

const percentage = value => {
  if (isNaN(value)) {
    return value;
  }

  const percentageValue = value * 100;

  let decimalPrecision = 0;
  if (percentageValue < 1) {
    const decimalPart = percentageValue.toString().substring(2);
    for (let i = 0; i < decimalPart.length; i++) {
      // Increment precision for each leading zero in decimal digits
      decimalPrecision++;
      if (decimalPart[i] !== '0') {
        break;
      }
    }
    decimalPrecision++;
  } else if (percentageValue < 100) {
    decimalPrecision = 1;
  }
  const floatNormalizer = 10 ** decimalPrecision;

  return `${Math.round(percentageValue * floatNormalizer) / floatNormalizer}%`;
};

const number = (value, { presentationOptions = {} }) => {
  const { valueFormat = '0,0' } = presentationOptions;
  return Number.isNaN(Number(value)) ? value : numeral(value).format(valueFormat);
};

const defaultFormatter = input =>
  Number.isNaN(Number(input)) ? input : truncateDecimalToPlace(2)(input);

const oneDecimalPlace = input =>
  Number.isNaN(Number(input)) ? input : truncateDecimalToPlace(1)(input);

const VALUE_TYPE_TO_FORMATTER = {
  [VALUE_TYPES.TEXT]: text,
  [VALUE_TYPES.PERCENTAGE]: percentage,
  [VALUE_TYPES.FRACTION_AND_PERCENTAGE]: fractionAndPercentage,
  [VALUE_TYPES.NUMBER_AND_PERCENTAGE]: numberAndPercentage,
  [VALUE_TYPES.FRACTION]: fraction,
  [VALUE_TYPES.CURRENCY]: currency,
  [VALUE_TYPES.BOOLEAN]: boolean,
  [VALUE_TYPES.NUMBER]: number,
  [VALUE_TYPES.ONE_DECIMAL_PLACE]: oneDecimalPlace,
};

export const formatDataValue = (value, valueType, metadata = {}) => {
  const formatter = VALUE_TYPE_TO_FORMATTER[valueType] || defaultFormatter;
  return formatter(value, metadata);
};
