/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { CHART_TYPES } from './constants';
import { CartesianChart } from './CartesianChart';
import { PieChart } from './PieChart';
import { parseChartConfig } from './parseChartConfig';
import { getIsTimeSeries, isDataKey } from './helpers';
import { useChartData } from './useChartData';
import { isMobile } from './utils';

const VIEW_STYLES = {
  newChartComing: {
    position: 'relative',
  },
  title: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.87)',
    marginTop: 5,
    marginBottom: 15,
    lineHeight: '130%',
    textAlign: 'center',
  },
  chartViewContainer: isMobile()
    ? {}
    : {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      },
  chartContainer: isMobile()
    ? {
        height: 200,
        textAlign: 'center',
        position: 'relative',
      }
    : {
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: '100%',
        alignContent: 'stretch',
        alignItems: 'stretch',
      },
};

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

export const Chart = ({
  projectCode,
  organisationUnitCode,
  dashboardGroupId,
  viewId,
  isExporting,
  isEnlarged,
  onItemClick,
}) => {
  const { data: viewContent, isLoading } = useChartData({
    projectCode,
    organisationUnitCode,
    dashboardGroupId,
    viewId,
  });

  if (isLoading) {
    return '...loading';
  }

  const { chartType } = viewContent;

  if (!Object.values(CHART_TYPES).includes(chartType)) {
    return <UnknownChart />;
  }

  console.log('viewContent!!!', viewContent);

  const viewContentConfig = getViewContent(viewContent);

  const ChartComponent = chartType === CHART_TYPES.PIE ? PieChart : CartesianChart;

  return (
    <div style={VIEW_STYLES.chartViewContainer}>
      <Container style={VIEW_STYLES.chartContainer}>
        <ChartComponent
          isEnlarged={isEnlarged}
          isExporting={isExporting}
          viewContent={viewContentConfig}
          onItemClick={onItemClick}
        />
      </Container>
    </div>
  );
};

Chart.propTypes = {
  projectCode: PropTypes.string.isRequired,
  organisationUnitCode: PropTypes.string.isRequired,
  dashboardGroupId: PropTypes.string.isRequired,
  viewId: PropTypes.string.isRequired,
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  onItemClick: PropTypes.func,
};

Chart.defaultProps = {
  isEnlarged: false,
  isExporting: false,
  onItemClick: () => {},
};
