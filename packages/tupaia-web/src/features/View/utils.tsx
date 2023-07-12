import React from 'react';
import numeral from 'numeral';
import PositiveIcon from '@material-ui/icons/CheckCircle';
import NegativeIcon from '@material-ui/icons/Cancel';
import { ViewConfig } from '@tupaia/types';

export enum VALUE_TYPES {
  BOOLEAN = 'boolean',
  CURRENCY = 'currency',
  FRACTION = 'fraction',
  PERCENTAGE = 'percentage',
  FRACTION_AND_PERCENTAGE = 'fractionAndPercentage',
  NUMBER_AND_PERCENTAGE = 'numberAndPercentage',
  TEXT = 'text',
  NUMBER = 'number',
  ONE_DECIMAL_PLACE = 'oneDecimalPlace',
}

const truncateDecimalToPlace = (decimalPlace: number) => (number: number) => {
  const place = 10 ** decimalPlace;
  return Math.floor(number * place) / place;
};

// Note: will display 0 if passed undefined
const currency = (value: string | number) => numeral(value).format('$0.00a');

const fraction = (
  value: number,
  {
    total,
  }: {
    total?: number;
  },
) => {
  if (total === undefined || isNaN(total)) return 'No data';
  return `${String(value)}/${String(total)}`;
};

const fractionAndPercentage = (
  value: number,
  {
    numerator,
    denominator,
  }: {
    numerator?: number;
    denominator?: number;
  },
) => {
  if (isNaN(value)) return value;
  return `${numerator}/${denominator} = ${percentage(value)}`;
};

const numberAndPercentage = (
  value: number,
  {
    numerator,
    denominator,
  }: {
    numerator?: number;
    denominator?: number;
  },
) => {
  if (isNaN(value)) return value;
  return `${value} (${percentage(numerator! / denominator!)})`;
};

const text = (value: any) => String(value);

const boolean = (
  value: number,
  {
    presentationOptions = {},
  }: {
    presentationOptions?: ViewConfig['presentationOptions'];
  },
) => {
  const isPositive = value > 0;
  const Icon = isPositive ? PositiveIcon : NegativeIcon;
  const colorKey = isPositive ? 'yes' : 'no';
  const defaultColors = { yes: BLUE, no: GREY };
  const color = presentationOptions[colorKey]
    ? presentationOptions[colorKey].color
    : defaultColors[colorKey];
  return (
    <div>
      <Icon />
    </div>
  );
};

const percentage = (value: number) => {
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

const number = (
  value: string | number,
  {
    presentationOptions = {},
  }: {
    presentationOptions?: ViewConfig['presentationOptions'];
  },
) => {
  const { valueFormat = '0,0' } = presentationOptions;
  return Number.isNaN(Number(value)) ? value : numeral(value).format(valueFormat);
};

const defaultFormatter = (input: string | number) =>
  Number.isNaN(Number(input)) ? input : truncateDecimalToPlace(2)(input as number);

const oneDecimalPlace = (input: string | number) =>
  Number.isNaN(Number(input)) ? input : truncateDecimalToPlace(1)(input as number);

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

export const formatDataValue = (
  value: any,
  valueType: VALUE_TYPES,
  metadata: {
    presentationOptions?: ViewConfig['presentationOptions'];
    numerator?: number;
    denominator?: number;
    total?: number;
  } = {},
) => {
  const formatter = VALUE_TYPE_TO_FORMATTER[valueType] || defaultFormatter;
  return formatter(value, metadata);
};
