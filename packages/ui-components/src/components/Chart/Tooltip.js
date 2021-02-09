/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';

import { formatDataValue } from './utils';
import { VALUE_TYPES, CHART_TYPES, PRESENTATION_OPTIONS_SHAPE } from './constants';
import { formatTimestampForChart, getIsTimeSeries } from './helpers';

function formatLabelledValue(label, value, valueType, metadata) {
  const valueText = formatDataValue(value, valueType, metadata);
  if (label) {
    return `${label}: ${valueText}`;
  }
  return valueText;
}

const VIEW_STYLES = {
  tooltip: {
    color: 'rgba(255, 255, 255, 0.87)',
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '15px 10px 15px 5px',
  },
};

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

export const Tooltip = props => {
  const { payload = [], active, presentationOptions } = props;

  const filteredPayload = payload.filter(({ value }) => value !== undefined);
  if (active && filteredPayload.length >= 1) {
    if (payload.length === 1 && !presentationOptions) {
      return <SingleValueTooltip {...props} payload={filteredPayload} />;
    }
    return <MultiValueTooltip {...props} payload={filteredPayload} />;
  }
  return <div style={VIEW_STYLES.tooltip}>No Data</div>;
};

Tooltip.propTypes = {
  valueType: PropTypes.oneOf(Object.values(VALUE_TYPES)),
  presentationOptions: PropTypes.shape(PRESENTATION_OPTIONS_SHAPE),
  payload: PropTypes.array,
};

Tooltip.defaultProps = {
  payload: [],
  valueType: null,
  presentationOptions: null,
};

SingleValueTooltip.propTypes = Tooltip.propTypes;
MultiValueTooltip.propTypes = Tooltip.propTypes;
