/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { BaseChartConfig, ValueType } from '@tupaia/types';
import { ReferenceAreaProps } from 'recharts';
import { GRANULARITY_SHAPE } from '@tupaia/utils';

// Todo: move some of these types to @tupaia/types and integrate
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

export type LegendPosition = 'top' | 'bottom';

/**
 *   {
 *     "type":"chart",
 *     "chartType":"pie",
 *     "name":"% Stock on Hand",
 *     "valueType": "percentage",
 *     "presentationOptions": {
 *       "sectorKey1": { "color": "#111111", "label": "Satanic" },
 *       "sectorKey2": { "color": "#222222", "label": "Nesting" },
 *       "sectorKey3": { "color": "#333333", "label": "HelpMe" }
 *     },
 *     "data":[{ name: "Total value stock consumables", value:24063409.4 },
 *             { name: "Total value stock medicines", value:24565440.6 },
 *             ...]
 *   }
 */

export type VizPeriodGranularity = typeof GRANULARITY_SHAPE;

type ConditionalMatrixConditionShape = {
  key: string;
  color: string;
  label?: string;
  legendLabel?: string;
  condition: number | object;
  description?: string;
};

export type PresentationOptions = {
  type?: string;
  showRawValue?: boolean;
  periodTickFormat?: string;
  exportWithLabels?: boolean;
  hideAverage?: boolean;
  valueFormat?: string;
  conditions?: ConditionalMatrixConditionShape[];
  referenceLines?: any;
};

export interface ViewContent<T = {}> {
  chartType: ChartType;
  valueType?: ValueType;
  name?: string;
  xName?: string;
  yName?: string;
  ticks?: string;
  noDataMessage?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  colorPalette?: string;
  periodGranularity?: VizPeriodGranularity;
  labelType?: string;
  data: DataProps[];
  chartConfig: T;
  presentationOptions?: PresentationOptions;
  renderLegendForOneItem?: boolean;
  referenceAreas?: ReferenceAreaProps[];
}
