import numeral from 'numeral';

export const VALUE_TYPES = {
  BOOLEAN: 'boolean',
  CURRENCY: 'currency',
  FRACTION: 'fraction',
  PERCENTAGE: 'percentage',
  FRACTION_AND_PERCENTAGE: 'fractionAndPercentage',
  NUMBER_AND_PERCENTAGE: 'numberAndPercentage',
  TEXT: 'text',
  NUMBER: 'number',
  ONE_DECIMAL_PLACE: 'oneDecimalPlace',
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
  const percentage = (numerator / denominator) * 100;
  return `${value} (${percentage === 0 ? 0 : percentage.toFixed(1)}%)`;
};

const text = value => String(value);

/**
 * Note: boolean types are no return a react component
 * The MultiValueWrapper component needs to be updated to handle this when tupaia is moved to use ui-components
 * @see: https://github.com/beyondessential/tupaia-backlog/issues/2156
 */
const boolean = value => value > 0;

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

const number = (value, { presentationOptions }) => {
  const valueFormat = presentationOptions?.valueFormat ? presentationOptions.valueFormat : '0,0';
  return Number.isNaN(Number(value)) ? value : numeral(value).format(valueFormat);
};

const defaultFormatter = input =>
  Number.isNaN(Number(input)) ? input : numeral(input).format('0.[00]');

const oneDecimalPlace = input =>
  Number.isNaN(Number(input)) ? input : numeral(input).format('0.[0]');

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

export const formatDataValueByType = ({ value, metadata = {} }, valueType) => {
  const formatter = VALUE_TYPE_TO_FORMATTER[valueType] || defaultFormatter;
  return formatter(value, metadata);
};
