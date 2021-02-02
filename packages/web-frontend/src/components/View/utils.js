/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import numeral from 'numeral';
import PositiveIcon from '@material-ui/icons/CheckCircle';
import NegativeIcon from '@material-ui/icons/Cancel';
import { VALUE_TYPES, BLUE, GREY } from './constants';
import { VIEW_STYLES } from '../../styles';
import { ChartWrapper } from './ChartWrapper';
import { ColorListWrapper } from './ColorListWrapper';
import { DataDownloadWrapper } from './DataDownloadWrapper';
import { ListWrapper } from './ListWrapper';
import { MatrixWrapper } from './MatrixWrapper';
import { MultiPhotoWrapper } from './MultiPhotoWrapper';
import { MultiSingleValueWrapper } from './MultiSingleValueWrapper';
import { MultiValueRowWrapper } from './MultiValueRowWrapper';
import { MultiValueWrapper } from './MultiValueWrapper';
import { SingleComparisonWrapper } from './SingleComparisonWrapper';
import { SingleDateWrapper } from './SingleDateWrapper';
import { SingleDownloadLinkWrapper } from './SingleDownloadLinkWrapper';
import { SingleTickWrapper } from './SingleTickWrapper';
import { SingleValueWrapper } from './SingleValueWrapper';

const SINGLE_VALUE_COMPONENTS = {
  singleTick: SingleTickWrapper,
  singleValue: SingleValueWrapper,
  singleDate: SingleDateWrapper,
  singleDownloadLink: SingleDownloadLinkWrapper,
  singleComparison: SingleComparisonWrapper,
};

const VIEW_TYPES = {
  dataDownload: DataDownloadWrapper,
  multiValue: MultiValueWrapper,
  multiValueRow: MultiValueRowWrapper,
  multiPhotograph: MultiPhotoWrapper,
  multiSingleValue: MultiSingleValueWrapper,
  list: ListWrapper,
  colorList: ColorListWrapper,
  ...SINGLE_VALUE_COMPONENTS,
};

export const getViewWrapper = ({ type, viewType }) => {
  switch (type) {
    case 'chart':
      return ChartWrapper;
    case 'matrix':
      return MatrixWrapper;
    default:
    case 'view': {
      const ViewWrapper = VIEW_TYPES[viewType];
      if (!ViewWrapper) {
        return (
          <div style={VIEW_STYLES.newChartComing}>
            <h2 style={VIEW_STYLES.title}>New dashboard element coming soon</h2>
          </div>
        );
      }
      return ViewWrapper;
    }
  }
};

export const getIsSingleValue = ({ viewType }) => {
  return Object.keys(SINGLE_VALUE_COMPONENTS).includes(viewType);
};

export const getIsMatrix = viewContent => {
  return viewContent && viewContent.type === 'matrix';
};

export const getIsDataDownload = viewContent => {
  return viewContent && viewContent.viewType === 'dataDownload';
};

export const isMobile = () => process.env.REACT_APP_APP_TYPE === 'mobile';

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
    height: 50,
    color,
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '20px',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
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
