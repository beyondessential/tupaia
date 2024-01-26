/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Typography from '@material-ui/core/Typography';
import { NoData } from '@tupaia/ui-components';
import styled from 'styled-components';
import { ChartType } from '@tupaia/types';
import { getIsTimeSeries, isDataKey, parseChartConfig, getIsChartData } from '../utils';
import {
  LegendPosition,
  ParsedGaugeChartViewContent,
  ParsedPieChartViewContent,
  ParsedCartesianChartViewContent,
  UnparsedChartViewContent,
} from '../types';
import { CartesianChart } from './CartesianChart';
import { PieChart, GaugeChart } from './Charts';

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

const removeNonNumericData = (data: any[]) =>
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
  const { data } = viewContent;
  const massagedData = sortData(removeNonNumericData(data));
  const chartConfig = 'chartConfig' in viewContent ? viewContent.chartConfig : undefined;
  return chartConfig
    ? {
        ...viewContent,
        data: massagedData,
        chartConfig: parseChartConfig(viewContent),
      }
    : { ...viewContent, data: massagedData };
};

interface ChartProps {
  viewContent: UnparsedChartViewContent;
  isEnlarged?: boolean;
  isExporting?: boolean;
  onItemClick?: (item: any) => void;
  legendPosition?: LegendPosition;
}

export const Chart = ({
  viewContent,
  isExporting = false,
  isEnlarged = true,
  onItemClick = () => {},
  legendPosition = 'bottom',
}: ChartProps) => {
  const { chartType } = viewContent;

  if (!Object.values(ChartType).includes(chartType)) {
    return <UnknownChart />;
  }

  if (!getIsChartData({ chartType: viewContent.chartType, data: viewContent.data })) {
    return <NoData viewContent={viewContent} />;
  }

  const viewContentConfig = getViewContent(viewContent);

  const commonProps = {
    isEnlarged,
    isExporting,
    onItemClick,
    legendPosition,
  };

  // Each of these has a quite different type for viewContent, so we need to cast it
  switch (chartType) {
    case ChartType.Pie:
      return (
        <PieChart viewContent={viewContentConfig as ParsedPieChartViewContent} {...commonProps} />
      );

    case ChartType.Gauge:
      return (
        <GaugeChart
          viewContent={viewContentConfig as ParsedGaugeChartViewContent}
          {...commonProps}
        />
      );
    default:
      return (
        <CartesianChart
          viewContent={viewContentConfig as ParsedCartesianChartViewContent}
          {...commonProps}
        />
      );
  }
};
