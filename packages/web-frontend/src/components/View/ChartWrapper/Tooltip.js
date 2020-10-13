/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import { VIEW_STYLES } from '../../../styles';
import { formatDataValue } from '../../../utils';
import { VALUE_TYPES } from '../constants';
import { PRESENTATION_OPTIONS_SHAPE } from '../propTypes';
import { CHART_TYPES } from './chartTypes';
import { formatTimestampForChart, getIsTimeSeries } from './helpers';

function formatLabelledValue(label, value, valueType, metadata) {
  const valueText = formatDataValue(value, valueType, metadata);
  if (label) {
    return `${label}: ${valueText}`;
  }
  return valueText;
}

const MultiValueTooltip = ({
  valueType,
  chartConfig,
  presentationOptions,
  payload,
  periodGranularity,
  labelType,
  chartType,
}) => {
  const data = payload[0].payload;
  const { name: headline, timestamp } = data;

  if (chartType) {
    if (chartType === CHART_TYPES.BAR) {
      payload.reverse();
    }
    if (chartType === CHART_TYPES.LINE) {
      payload.sort((obj1, obj2) => obj2.value - obj1.value);
    }
  }

  const valueLabels = payload.map(({ dataKey, value }) => {
    const options = chartConfig && chartConfig[dataKey];
    const label = (options && options.label) || dataKey;
    const valueTypeForLabel = labelType || valueType || get(chartConfig, [dataKey, 'valueType']);

    const metadata = data[`${dataKey}_metadata`] || data[`${data.name}_metadata`] || {};

    return (
      <li key={dataKey}>
        {formatLabelledValue(label, value, valueTypeForLabel, {
          presentationOptions,
          ...metadata,
        })}
      </li>
    );
  });

  return (
    <div style={VIEW_STYLES.tooltip}>
      {headline ||
        (getIsTimeSeries([data]) &&
          periodGranularity &&
          formatTimestampForChart(timestamp, periodGranularity))}
      <ul>{valueLabels}</ul>
    </div>
  );
};

const SingleValueTooltip = ({ valueType, payload, periodGranularity, labelType }) => {
  const data = payload[0].payload;
  const { name, value, timestamp } = data;
  const metadata = data.value_metadata;

  const valueTypeForLabel = labelType || valueType;

  return (
    <div style={VIEW_STYLES.tooltip}>
      {getIsTimeSeries([payload[0].payload]) && periodGranularity ? (
        <div>
          <p>{formatTimestampForChart(timestamp, periodGranularity)}</p>
          {formatDataValue(value, valueTypeForLabel, metadata)}
        </div>
      ) : (
        formatLabelledValue(name, value, valueTypeForLabel, metadata)
      )}
    </div>
  );
};

function Tooltip(props) {
  if (props.active && props.payload.length >= 1) {
    if (props.payload.length === 1 && !props.presentationOptions) {
      return <SingleValueTooltip {...props} />;
    }
    return <MultiValueTooltip {...props} />;
  }
  return null;
}

Tooltip.propTypes = {
  valueType: PropTypes.oneOf(Object.values(VALUE_TYPES)),
  payload: PropTypes.any,
  presentationOptions: PropTypes.shape(PRESENTATION_OPTIONS_SHAPE),
};

SingleValueTooltip.propTypes = Tooltip.propTypes;
MultiValueTooltip.propTypes = Tooltip.propTypes;

export default Tooltip;
