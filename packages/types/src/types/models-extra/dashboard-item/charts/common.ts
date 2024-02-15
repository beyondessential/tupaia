/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { CssColor } from '../../../css';
import { BaseConfig, ExportPresentationOptions, ValueType } from '../common';

/**
 * These are the common chart config options that are shared between several chart types
 */
export enum ChartType {
  Area = 'area',
  Bar = 'bar',
  Composed = 'composed',
  Line = 'line',
  Pie = 'pie',
  Gauge = 'gauge',
}

type YAxisDomainEntry = {
  type: 'number' | 'scale' | 'clamp' | 'string';
  value?: number | string;
  min?: number;
  max?: number;
};
export type YAxisDomain = {
  max: YAxisDomainEntry;
  min: YAxisDomainEntry;
};

/**
 * @description The base chart config on all chart types
 */
export type BaseChartConfig = BaseConfig & {
  type: 'chart';
  chartType: ChartType;
  ticks?: any;

  startDate?: string;
  endDate?: string;

  valueType?: ValueType;

  showPeriodRange?: 'all';

  /**
   * @description Some chart types take 'color' as an option
   */
  color?: string;

  displayOnLevel?: any;

  label?: any;

  /**
   * @description Some charts can have their label customised
   */
  labelType?: 'fractionAndPercentage' | 'number' | 'fraction';

  measureLevel?: any;

  renderLegendForOneItem?: boolean;
};

export const isChartConfig = (config?: BaseConfig): config is BaseChartConfig => {
  return (config && 'type' in config && config.type === 'chart') ?? false;
};

export type ReferenceLinesConfig = {
  referenceValue?: number;
  referenceLabel?: string;
};

export type CartesianChartPresentationOptions = ExportPresentationOptions & {
  /**
   * @description This string is one of the [Moment.js format]{@link https://momentjs.com/docs/#/displaying/format/} values
   */
  periodTickFormat?: string;
  hideAverage?: boolean;
  referenceLines?: {
    targetLine?: ReferenceLinesConfig;
  };
};

type Key = string | '$all';

/**
 * @description The chartConfig property is different to the general config options. It is keyed by column name OR the special marker '$all' for all columns
 */
export type ChartConfigObject = ReferenceLinesConfig & {
  color?: CssColor;
  label?: string;
  stackId?: number;
  legendOrder?: number;
  yAxisDomain?: YAxisDomain;
  valueType?: ValueType;
  yAxisOrientation?: 'left' | 'right';
  hideFromLegend?: boolean;
  yName?: string;
  labelType?: BaseChartConfig['labelType'];
  chartType?: ChartType | never;
  opacity?: 'ascending' | 'descending' | number;
};

export type ChartConfigT = {
  /**
   * @description key of column name or special marker '$all' for all columns
   */
  [key: Key]: ChartConfigObject;
};

/**
 * @description A Cartesian chart has an area with axes e.g. bar, line. It extends the base chart config
 */
export type CartesianChartConfig = BaseChartConfig & {
  /**
   * @description The label on the x-axis
   */
  xName?: string;

  /**
   * @description The label on the y-axis
   */
  yName?: string;

  /**
   * @description Configuration options for the y-axis
   */
  yAxisDomain?: YAxisDomain;
  chartConfig?: ChartConfigT;
  presentationOptions?: CartesianChartPresentationOptions;
};
