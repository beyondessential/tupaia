/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Chart } from '@tupaia/ui-components/lib/chart';
import { VIEW_STYLES, darkWhite } from '../../../styles';
import { VIEW_CONTENT_SHAPE } from '../propTypes';
import { CHART_TYPES } from './chartTypes';
import { parseChartConfig } from './parseChartConfig';
import { getIsTimeSeries, isDataKey } from './helpers';

const ViewTitle = styled(Typography)`
  position: relative;
  color: ${darkWhite};
  margin-top: 5;
  margin-bottom: 15;
  line-height: 130%;
  text-align: center;
`;

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

const getViewContent = ({ viewContent }) => {
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

const sortData = data =>
  getIsTimeSeries(data) ? data.sort((a, b) => a.timestamp - b.timestamp) : data;

export const ChartWrapper = ({ viewContent, isEnlarged, isExporting, onItemClick }) => {
  const viewContentConfig = getViewContent({ viewContent });
  const { chartType } = viewContent;

  if (!Object.values(CHART_TYPES).includes(chartType)) {
    return <ViewTitle variant="h2">New chart coming soon</ViewTitle>;
  }

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
