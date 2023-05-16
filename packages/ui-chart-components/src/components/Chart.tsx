/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { SmallAlert } from '@tupaia/ui-components';
import { CartesianChart } from './CartesianChart';
import { PieChart, GaugeChart } from './Charts';
import {
  getIsTimeSeries,
  isDataKey,
  parseChartConfig,
  getIsChartData,
  getNoDataString,
} from '../utils';
import { CHART_TYPES } from '../constants';

interface ChartProps {
  viewContent: {
    name?: string;
    chartType?: string;
    data?: any[];
    chartConfig?: any;
  };
  isEnlarged?: boolean;
  isExporting?: boolean;
  onItemClick?: (item: any) => void;
  legendPosition?: string;
}

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

const UnknownChart: React.FC = () => (
  <UnknownChartContainer>
    <UnknownChartTitle variant="h2">New chart coming soon</UnknownChartTitle>
  </UnknownChartContainer>
);

const NoData = styled(SmallAlert)`
  align-self: center;
  margin-left: auto;
  margin-right: auto;
`;

const removeNonNumericData = (data: any[]): any[] =>
  data.map(dataSeries => {
    const filteredDataSeries: any = {};
    Object.entries(dataSeries).forEach(([key, value]) => {
      if (!isDataKey(key) || !Number.isNaN(Number(value))) {
        filteredDataSeries[key] = value;
      }
    });
    return filteredDataSeries;
  });

const sortData = (data: any[]): any[] =>
  getIsTimeSeries(data) ? data.sort((a, b) => a.timestamp - b.timestamp) : data;

const getViewContent = (viewContent: ChartProps['viewContent']) => {
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

const getChartComponent = chartType => {
  switch (chartType) {
    case CHART_TYPES.PIE:
      return PieChart;
    case CHART_TYPES.GAUGE:
      return GaugeChart;
    default:
      return CartesianChart;
  }
};

export const Chart: React.FC<ChartProps> = ({
  viewContent,
  isExporting = false,
  isEnlarged = true,
  onItemClick = () => {},
  legendPosition = 'bottom',
}) => {
  const { chartType } = viewContent;

  if (!Object.values(CHART_TYPES).includes(chartType)) {
    return <UnknownChart />;
  }

  if (!getIsChartData(viewContent)) {
    return (
      <NoData severity="info" variant="standard">
        {getNoDataString(viewContent)}
      </NoData>
    );
  }

  const viewContentConfig = getViewContent(viewContent);
  const ChartComponent = getChartComponent(chartType);

  return (
    <ChartComponent
      isEnlarged={isEnlarged}
      isExporting={isExporting}
      viewContent={viewContentConfig}
      onItemClick={onItemClick}
      legendPosition={legendPosition}
    />
  );
};
