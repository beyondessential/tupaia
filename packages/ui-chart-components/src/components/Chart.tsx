/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Typography from '@material-ui/core/Typography';
import { NoData } from '@tupaia/ui-components';
import styled from 'styled-components';
import {
  ChartData,
  ChartType,
  isBarChartConfig,
  isComposedChartConfig,
  isGaugeChartConfig,
  isLineChartConfig,
  isPieChartConfig,
} from '@tupaia/types';
import { getIsTimeSeries, isDataKey, parseChartConfig, getIsChartData } from '../utils';
import { LegendPosition, ChartViewContent } from '../types';
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

const sortData = (data: ChartData[]) =>
  getIsTimeSeries(data)
    ? data.sort((a, b) => {
        const { timestamp: timestampA } = a;
        const { timestamp: timestampB } = b;
        // If either timestamp is undefined, return 0, which will almost never happen because we are already checking for timestamp fields in the getIsTimeSeries function, but TS doesn't seem to pickup on that
        if (timestampA === undefined || timestampB === undefined) return 0;
        return timestampA - timestampB;
      })
    : data;

const parseViewContent = <T extends ChartViewContent>(viewContent: T): T => {
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

interface ChartProps<T extends ChartViewContent> {
  viewContent: T;
  isEnlarged?: boolean;
  isExporting?: boolean;
  onItemClick?: (item: any) => void;
  legendPosition?: LegendPosition;
}

export const Chart = <T extends ChartViewContent>({
  viewContent,
  isExporting = false,
  isEnlarged = true,
  onItemClick = () => {},
  legendPosition = 'bottom',
}: ChartProps<T>) => {
  const { chartType } = viewContent;

  if (!Object.values(ChartType).includes(chartType)) {
    return <UnknownChart />;
  }

  if (!getIsChartData({ chartType: viewContent.chartType, data: viewContent.data })) {
    return <NoData viewContent={viewContent} />;
  }

  const commonProps = {
    isEnlarged,
    isExporting,
    onItemClick,
    legendPosition,
  };

  if (isPieChartConfig(viewContent)) {
    const viewContentConfig = parseViewContent(viewContent);
    return <PieChart viewContent={viewContentConfig} {...commonProps} />;
  }

  if (isGaugeChartConfig(viewContent)) {
    const viewContentConfig = parseViewContent(viewContent);
    return <GaugeChart viewContent={viewContentConfig} {...commonProps} />;
  }

  if (
    isBarChartConfig(viewContent) ||
    isLineChartConfig(viewContent) ||
    isComposedChartConfig(viewContent)
  ) {
    const viewContentConfig = parseViewContent(viewContent);
    return <CartesianChart viewContent={viewContentConfig} {...commonProps} />;
  }
  // if the chart is an unsupported type, return null. Very unlikely to happen, but we need to handle it
  return null;
};
