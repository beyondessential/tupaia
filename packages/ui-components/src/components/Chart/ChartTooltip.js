/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import get from 'lodash.get';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { formatDataValueByType } from '@tupaia/utils';
import { VALUE_TYPES, CHART_TYPES, PRESENTATION_OPTIONS_SHAPE } from './constants';
import { formatTimestampForChart, getIsTimeSeries } from './utils';
import { TooltipContainer } from './TooltipContainer';

function formatLabelledValue(label, value, valueType, metadata) {
  const valueText = formatDataValueByType({ value, metadata }, valueType);
  if (label) {
    return `${label}: ${valueText}`;
  }
  return valueText;
}

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  margin-bottom: 0.5rem;
  color: #2c3236;
`;

const Text = styled(Typography)`
  color: #2c3236;
`;

const List = styled.ul`
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  font-size: 0.875rem;
  line-height: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const Box = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 5px;
`;

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

  const valueLabels = payload.map(({ dataKey, value, color }) => {
    const options = chartConfig && chartConfig[dataKey];
    const label = (options && options.label) || dataKey;
    const valueTypeForLabel =
      labelType ||
      valueType ||
      get(chartConfig, [dataKey, 'labelType']) ||
      get(chartConfig, [dataKey, 'valueType']);

    const metadata = data[`${dataKey}_metadata`] || data[`${data.name}_metadata`] || {};

    return (
      <ListItem key={dataKey}>
        <Box style={{ background: color }} />
        {formatLabelledValue(label, value, valueTypeForLabel, {
          presentationOptions,
          ...metadata,
        })}
      </ListItem>
    );
  });

  return (
    <TooltipContainer>
      <Heading>
        {headline ||
          (getIsTimeSeries([data]) &&
            periodGranularity &&
            formatTimestampForChart(timestamp, periodGranularity))}
      </Heading>
      <List>{valueLabels}</List>
    </TooltipContainer>
  );
};

const SingleValueTooltip = ({ valueType, payload, periodGranularity, labelType }) => {
  const data = payload[0].payload;
  const { name, value, timestamp } = data;
  const metadata = data.value_metadata;

  const valueTypeForLabel = labelType || valueType;

  return (
    <TooltipContainer>
      {getIsTimeSeries([payload[0].payload]) && periodGranularity ? (
        <>
          <Heading>{formatTimestampForChart(timestamp, periodGranularity)}</Heading>
          <Text>{formatDataValueByType({ value, metadata }, valueTypeForLabel)}</Text>
        </>
      ) : (
        <Heading>{formatLabelledValue(name, value, valueTypeForLabel, metadata)}</Heading>
      )}
    </TooltipContainer>
  );
};

const NoDataTooltip = ({ payload, periodGranularity }) => {
  const data = payload[0]?.payload;
  const { name = undefined, timestamp = undefined } = data || {};

  return (
    <TooltipContainer>
      <Heading>
        {name ||
          (getIsTimeSeries([data]) &&
            periodGranularity &&
            formatTimestampForChart(timestamp, periodGranularity))}
      </Heading>
      <Text>No Data</Text>
    </TooltipContainer>
  );
};

export const ChartTooltip = props => {
  const { payload, active, presentationOptions } = props;

  const data = payload || []; // This is to handle when recharts overrides the payload as null
  const filteredPayload = data.filter(({ value }) => ![null, undefined].includes(value));

  if (active && filteredPayload.length >= 1) {
    if (data.length === 1 && !presentationOptions) {
      return <SingleValueTooltip {...props} payload={filteredPayload} />;
    }

    return <MultiValueTooltip {...props} payload={filteredPayload} />;
  }

  // For no data display, pass the non-filtered data so we can pull the name
  return <NoDataTooltip {...props} payload={data} />;
};

ChartTooltip.propTypes = {
  valueType: PropTypes.oneOf(Object.values(VALUE_TYPES)),
  presentationOptions: PropTypes.shape(PRESENTATION_OPTIONS_SHAPE),
  payload: PropTypes.array,
};

ChartTooltip.defaultProps = {
  payload: [],
  valueType: null,
  presentationOptions: null,
};

SingleValueTooltip.propTypes = ChartTooltip.propTypes;
MultiValueTooltip.propTypes = ChartTooltip.propTypes;
NoDataTooltip.propTypes = ChartTooltip.propTypes;
