/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { BaseChartConfig, ChartPresentationOptions } from '@tupaia/types';
import { ReferenceAreaProps } from 'recharts';
import { GRANULARITY_SHAPE } from '@tupaia/utils';

export interface DataProps {
  name: string;
  value: string | number;
  timestamp?: string;
}

export type TableAccessor = Function | string;

export interface LooseObject {
  [k: string]: any;
}

export enum ChartType {
  Area = 'area',
  Bar = 'bar',
  Composed = 'composed',
  Line = 'line',
  Pie = 'pie',
  Gauge = 'gauge',
}

/**
 * This is a tupaia specific setting rather than a recharts config option.
 */
export type LegendPosition = 'top' | 'bottom';

export type VizPeriodGranularity = typeof GRANULARITY_SHAPE;

/**
 * View Content is the data structure that is passed to the chart components. It contains both the
 * data and the configuration for the chart. It only exists on the front end.
 */
export interface ViewContent<T = BaseChartConfig, CT = ChartType> {
  chartType: CT;
  name?: string;
  xName?: string;
  yName?: string;
  ticks?: string;
  noDataMessage?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  colorPalette?: string;
  color?: string;
  periodGranularity?: VizPeriodGranularity;
  labelType?: string;
  data: DataProps[];
  chartConfig: T;
  presentationOptions?: ChartPresentationOptions;
  renderLegendForOneItem?: boolean;
  referenceAreas?: ReferenceAreaProps[];
}
