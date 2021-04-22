/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { CartesianChart } from './CartesianChart';
import { PieChart } from './PieChart';
import { CHART_TYPES } from './constants';
import { parseChartConfig } from './parseChartConfig';
import { getIsTimeSeries, isDataKey } from './utils';
import { SmallAlert } from '../Alert';

const UnknownChartTitle = styled(Typography)`
  position: relative;
  color: rgba(255, 255, 255, 0.87);
  margin-top: 0.3rem;
  margin-bottom: 0.9rem;
  line-height: 130%;
  text-align: center;
`;

const UnknownChartContainer = styled.div`
  position: relative;
`;

const UnknownChart = () => (
  <UnknownChartContainer>
    <UnknownChartTitle variant="h2">New chart coming soon</UnknownChartTitle>
  </UnknownChartContainer>
);

const NoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

const removeNonNumericData = data =>
  data.map(dataSeries => {
    const filteredDataSeries = {};
    Object.entries(dataSeries).forEach(([key, value]) => {
      if (!isDataKey(key) || !Number.isNaN(Number(value))) {
        filteredDataSeries[key] = value;
      }
    });
    return filteredDataSeries;
  });

const sortData = data =>
  getIsTimeSeries(data) ? data.sort((a, b) => a.timestamp - b.timestamp) : data;

const getViewContent = viewContent => {
  const { chartConfig, data } = viewContent;
  const massagedData = sortData(removeNonNumericData(data));
  return chartConfig
    ? {
        ...viewContent,
        data: massagedData,
        chartConfig: parseChartConfig(viewContent),
      }
    : { ...viewContent, data: massagedData };
};

const chartHasData = ({ chartType, data }) => {
  // If all segments of a pie chart are "0", display the no data message
  if (chartType === CHART_TYPES.PIE && data && data.every(segment => segment.value === 0)) {
    return false;
  }

  return data && data.length > 0;
};

const getNoDataString = ({ noDataMessage, source, startDate, endDate }) => {
  if (noDataMessage) {
    return noDataMessage;
  }

  if (source === 'mSupply') {
    return 'Requires mSupply';
  }

  if (startDate && endDate) {
    return `No data for ${startDate} to ${endDate}`;
  }

  return 'No data for selected dates';
};

export const Chart = ({ viewContent, isExporting, isEnlarged, onItemClick }) => {
  const { chartType } = viewContent;

  if (!Object.values(CHART_TYPES).includes(chartType)) {
    return <UnknownChart />;
  }

  if (!chartHasData(viewContent)) {
    return (
      <NoData severity="info" variant="standard">
        {getNoDataString(viewContent)}
      </NoData>
    );
  }

  const viewContentConfig = getViewContent(viewContent);
  const ChartComponent = chartType === CHART_TYPES.PIE ? PieChart : CartesianChart;

  return (
    <ChartComponent
      isEnlarged={isEnlarged}
      isExporting={isExporting}
      viewContent={viewContentConfig}
      onItemClick={onItemClick}
    />
  );
};

Chart.propTypes = {
  viewContent: PropTypes.shape({
    name: PropTypes.string,
    chartType: PropTypes.string,
    data: PropTypes.array,
  }),
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  onItemClick: PropTypes.func,
};

Chart.defaultProps = {
  viewContent: null,
  isEnlarged: false,
  isExporting: false,
  onItemClick: () => {},
};
