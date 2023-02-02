/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { BaseConfig, ValueType } from './common';
import { CssColor } from '../../css';

type BaseChartConfig = BaseConfig & {
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

/**
 * @description Gauge Chart
 */
export type GaugeChartConfig = BaseChartConfig & {
  type: 'chart';
  chartType: 'gauge';
};

/**
 * @description A Composed chart is a concept from Recharts, e.g. a line chart layered on top of a bar chart
 */
export type ComposedChartConfig = BaseChartConfig &
  CartesianChartConfig & {
    type: 'chart';
    chartType: 'composed';
    chartConfig?: CommonChartChartConfig;
  };

/**
 * @description Bar Chart
 */
export type BarChartConfig = BaseChartConfig &
  CartesianChartConfig & {
    type: 'chart';
    chartType: 'bar';
    chartConfig?: CommonChartChartConfig;
  };

/**
 * @description Pie Chart
 */
export type PieChartConfig = BaseChartConfig & {
  type: 'chart';
  chartType: 'pie';
  presentationOptions?: {
    [key: string]: {
      color: CssColor;
    };
  };
};

/**
 * @description Line Chart
 */
export type LineChartConfig = BaseChartConfig &
  CartesianChartConfig & {
    type: 'chart';
    chartType: 'line';
    chartConfig?: CommonChartChartConfig;
  };

type CommonChartChartConfig = {
  /**
   * @description key of column name or special marker '$all' for all columns
   */
  [key: string]: {
    color?: CssColor;
    label?: string;
    stackId?: number;
    legendOrder?: number;
    yAxisDomain?: any;
    valueType?: ValueType;
  };
};

/**
 * A Cartesian chart has an area with axes e.g. bar, line.
 */
type CartesianChartConfig = {
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

  presentationOptions?: any;
};

type YAxisDomain = {
  max: YAxisDomainEntry;
  min: YAxisDomainEntry;
};

type YAxisDomainEntry = {
  type: 'number' | 'scale' | 'clamp' | 'string';
  value?: number | string;
  min?: number;
  max?: number;
};

type ConditionValue = string | number;

enum ConditionType {
  '=' = '=',
  '>' = '>',
  '<' = '<',
  '>=' = '>=',
  '<=' = '<=',
}
