import { CssColor } from '../../../css';
import { DashboardItemType } from '../../common';
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

interface YAxisDomainEntry {
  type: 'number' | 'scale' | 'clamp' | 'string';
  value?: number | string;
  min?: number;
  max?: number;
}

export interface YAxisDomain {
  /**
   * @description
   * Domain configuration for the maximum y axis value.
   * eg.
   * // Cannot be higher than 100
   * {
   *   type: number
   *   value: 100
   * }
   *
   * // Clamp between 50, the maximum data value, and 100
   * {
   *   type: clamp
   *   min: 50
   *   max: 100
   * }
   *
   * // Scale the y axis to always be 10% higher than the maximum data value
   * {
   *   type: scale
   *   value: 1.1
   * }
   *
   * // 20 greater than the maximum data value
   * {
   *   type: string
   *   value: datamax + 20
   * }
   *
   * For more options see: https://recharts.org/en-US/api/YAxis#domain
   */
  max: YAxisDomainEntry;

  /**
   * @description
   * Domain configuration for the minimum y axis value.
   * eg.
   * // Cannot be lower than 0
   * {
   *   type: number
   *   value: 0
   * }
   *
   * // Clamp between 0, the minimum data value, and 10
   * {
   *   type: clamp
   *   min: 0
   *   max: 10
   * }
   *
   * // Scale the y axis to always be 10% lower than the minimum data value
   * {
   *   type: scale
   *   value: 0.9
   * }
   *
   * // 20 less than the minimum data value
   * {
   *   type: string
   *   value: datamin - 20
   * }
   *
   * For more options see: https://recharts.org/en-US/api/YAxis#domain
   */
  min: YAxisDomainEntry;
}

/**
 * @description The base chart config on all chart types
 */
export interface BaseChartConfig extends BaseConfig {
  type: `${DashboardItemType.Chart}`;
  chartType: ChartType;

  /**
   * @description Array of values to show as ticks on the y axis. See: https://recharts.org/en-US/api/YAxis#ticks
   */
  ticks?: unknown[];

  startDate?: string;
  endDate?: string;

  /**
   * @description Data type for this viz
   */
  valueType?: ValueType;

  /**
   * @description Set to 'all' to show the 'Latest available data:' message
   */
  showPeriodRange?: 'all';

  /**
   * @description Some chart types take 'color' as an option
   */
  color?: string;

  label?: any;

  /**
   * @description Some charts can have their label customised
   */
  labelType?: 'fractionAndPercentage' | 'number' | 'fraction';

  /**
   * @description Set to true to display the legend even if there is just a single series of data
   */
  renderLegendForOneItem?: boolean;
}

export const isChartConfig = (config?: BaseConfig): config is BaseChartConfig => {
  return (config && 'type' in config && config.type === 'chart') ?? false;
};

export type ReferenceLinesConfig = {
  /**
   * @description Value where the reference line is drawn (if not given no reference line will be drawn)
   */
  referenceValue: number;

  /**
   * @description Label shown on the reference line
   */
  referenceLabel?: string;
};

export interface CartesianChartPresentationOptions extends ExportPresentationOptions {
  /**
   * @description This string is one of the [Moment.js format]{@link https://momentjs.com/docs/#/displaying/format/} values
   */
  periodTickFormat?: string;
  /**
   * @description Hides the data average line
   */
  hideAverage?: boolean;
  /**
   * @description Configure reference lines to appear in on the viz
   */
  referenceLines?: {
    targetLine?: ReferenceLinesConfig;
  };
}

type Key = string | '$all';

/**
 * @description The chartConfig property is different to the general config options. It is keyed by column name OR the special marker '$all' for all columns
 */
export interface ChartConfigObject {
  color?: CssColor;

  /**
   * @description For a bar chart, series which share the same stackId will be stacked atop one another
   */
  stackId?: number;

  /**
   * @description What order in the legend should this series be shown
   */
  legendOrder?: number;

  /**
   * @description Minimum and maximum ranges for the y axis
   */
  yAxisDomain?: YAxisDomain;

  /**
   * @description Which axis this the values in this series are compared against
   */
  yAxisOrientation?: 'left' | 'right';

  /**
   * @description Whether or not this series is shown in the legend
   */
  hideFromLegend?: boolean;

  /**
   * @description The title of the Y axis
   */
  yName?: string;

  /**
   * @description Format of the data for this series
   */
  valueType?: ValueType;

  label?: string;

  /**
   * @description Format of the label shown on hover
   */
  labelType?: BaseChartConfig['labelType'];

  /**
   * @description
   * Opacity for this series of data on the chart. Can be ascending, descending, or a number between 0 and 1
   */
  opacity?: 'ascending' | 'descending' | number;

  chartType?: ChartType | never;
}

export interface ChartConfigT {
  /**
   * @description key of column name or special marker '$all' for all columns
   */
  [key: Key]: ChartConfigObject;
}

/**
 * @description A Cartesian chart has an area with axes e.g. bar, line. It extends the base chart config
 */
export interface CartesianChartConfig extends BaseChartConfig {
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

  /**
   * @description
   * Configuration for each series of data within this chart.
   * Note: use $all for configuration that applies to all series.
   *
   * eg.
   *  {
   *    In Stock: {
   *      color: green
   *    }
   *    Out of Stock: {
   *      color: red
   *    }
   *    $all: {
   *      hideFromLegend: true
   *    }
   *  }
   */
  chartConfig?: ChartConfigT;

  /**
   * @description Common options for configuring the chart presentation
   */
  presentationOptions?: CartesianChartPresentationOptions;
}
