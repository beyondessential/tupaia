/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { VIEW_STYLES } from '../../../styles';
import { VIEW_CONTENT_SHAPE } from '../propTypes';
import { CartesianChart } from './CartesianChart';
import { CHART_TYPES } from './chartTypes';
import { PieChart } from './PieChart';
import { parseChartConfig } from './parseChartConfig';
import { getIsTimeSeries, isDataKey } from './helpers';

const UnknownChart = () => (
  <div style={VIEW_STYLES.newChartComing}>
    <h2 style={VIEW_STYLES.title}>New chart coming soon</h2>
  </div>
);

const Container = styled.div`
  // recharts components doesn't pass nested styles so they need to be added on a wrapping component
  li.recharts-legend-item {
    white-space: nowrap; // ensure there are no line breaks on the export legends
  }
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

export const ChartWrapper = ({ viewContent, isExporting, isEnlarged, onItemClick }) => {
  const viewContentConfig = getViewContent(viewContent);
  const { chartType } = viewContentConfig;

  if (!Object.values(CHART_TYPES).includes(chartType)) {
    return <UnknownChart />;
  }

  const Chart = chartType === CHART_TYPES.PIE ? PieChart : CartesianChart;

  return (
    <div style={VIEW_STYLES.chartViewContainer}>
      <Container style={VIEW_STYLES.chartContainer}>
        <Chart
          isEnlarged={isEnlarged}
          isExporting={isExporting}
          viewContent={viewContentConfig}
          onItemClick={onItemClick}
        />
      </Container>
    </div>
  );
};

ChartWrapper.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  onItemClick: PropTypes.func,
};

ChartWrapper.defaultProps = {
  viewContent: null,
  isEnlarged: false,
  isExporting: false,
  onItemClick: () => {},
};
