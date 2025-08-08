import React from 'react';
import Typography from '@material-ui/core/Typography';
import { NoData } from '@tupaia/ui-components';
import styled from 'styled-components';
import {
  ChartConfig,
  ChartData,
  ChartReport,
  ChartType,
  isBarChartConfig,
  isComposedChartConfig,
  isGaugeChartConfig,
  isLineChartConfig,
  isPieChartConfig,
} from '@tupaia/types';
import { isDataKey, parseChartConfig, getIsChartData, getIsTimeSeries } from '../utils';
import { LegendPosition } from '../types';
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

const removeNonNumericData = (data?: ChartData[]) =>
  data?.map(dataSeries => {
    const filteredDataSeries: any = {};
    Object.entries(dataSeries).forEach(([key, value]) => {
      if (!isDataKey(key) || !Number.isNaN(Number(value))) {
        filteredDataSeries[key] = value;
      }
    });
    return filteredDataSeries;
  }) ?? [];

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

const parseConfig = <T extends ChartConfig>(config: T, report: ChartReport): T => {
  const chartConfig = 'chartConfig' in config ? config.chartConfig : undefined;
  return chartConfig
    ? {
        ...config,
        chartConfig: parseChartConfig(report, config),
      }
    : config;
};
const parseReport = <T extends ChartReport>(report: T): T => {
  const { data } = report;
  const massagedData = sortData(removeNonNumericData(data));
  return { ...report, data: massagedData };
};

interface ChartProps<T extends ChartConfig> {
  report: ChartReport;
  config: T;
  isEnlarged?: boolean;
  isExporting?: boolean;
  onItemClick?: (item: any) => void;
  legendPosition?: LegendPosition;
}

export const Chart = <T extends ChartConfig>({
  report,
  config,
  isExporting = false,
  isEnlarged = true,
  onItemClick = () => {},
  legendPosition = 'bottom',
}: ChartProps<T>) => {
  const { chartType } = config;

  if (!Object.values(ChartType).includes(chartType)) {
    return <UnknownChart />;
  }

  if (!getIsChartData(config.chartType, report)) {
    return <NoData config={config} report={report} />;
  }
  const parsedReport = parseReport(report);

  const commonProps = {
    isEnlarged,
    isExporting,
    onItemClick,
    legendPosition,
    report: parsedReport,
  };

  if (isPieChartConfig(config)) {
    const parsedConfig = parseConfig(config, parsedReport);
    return <PieChart config={parsedConfig} {...commonProps} />;
  }

  if (isGaugeChartConfig(config)) {
    const parsedConfig = parseConfig(config, parsedReport);
    return <GaugeChart config={parsedConfig} {...commonProps} />;
  }

  if (isBarChartConfig(config) || isLineChartConfig(config) || isComposedChartConfig(config)) {
    const parsedConfig = parseConfig(config, parsedReport);
    return <CartesianChart config={parsedConfig} {...commonProps} />;
  }
  // if the chart is an unsupported type, return null. Very unlikely to happen, but we need to handle it
  return null;
};
