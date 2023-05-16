/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
// Todo: move some of these types to @tupaia/types and integrate
export interface DataProps {
  name: string;
  value: string | number;
  timestamp?: string;
}

export enum ChartTypes {
  Area = 'area',
  Bar = 'bar',
  Composed = 'composed',
  Line = 'line',
  Pie = 'pie',
  Gauge = 'gauge',
}

// Todo: add period granularity to this type
export type ViewContent = {
  chartType: ChartTypes;
  valueType?: ValueTypes;
  name?: string;
  xName?: string;
  noDataMessage?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  colorPalette?: string;
  periodGranularity?: string;
  labelType?: string;
  data: DataProps[];
  chartConfig?: object;
};

export enum ValueTypes {
  Boolean = 'boolean',
  Currency = 'currency',
  Fraction = 'fraction',
  Percentage = 'percentage',
  FractionAndPercentage = 'fractionAndPercentage',
  NumberAndPercentage = 'numberAndPercentage',
  Text = 'text',
  Number = 'number',
  OneDecimalPlace = 'oneDecimalPlace',
}
