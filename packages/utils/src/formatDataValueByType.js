/**
 * Tupaia Web
 * Copyright (c) 2019 - 2021 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { VALUE_TYPES } from './constant';

const numberAndPercentage = (value, { numerator, denominator }) => {
  if (isNaN(value)) return value;
  const percentage = (numerator / denominator) * 100;
  return `${value} (${percentage === 0 ? 0 : percentage.toFixed(1)}%)`;
};

const VALUE_TYPE_TO_FORMATTER = {
  [VALUE_TYPES.NUMBER_AND_PERCENTAGE]: numberAndPercentage,
};

export const formatDataValueByType = ({ value, metadata = {} }, valueType) => {
  const formatter = VALUE_TYPE_TO_FORMATTER[valueType];
  return formatter(value, metadata);
};
