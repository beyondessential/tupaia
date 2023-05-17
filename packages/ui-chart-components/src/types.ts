/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { BaseChartConfig } from '@tupaia/types';
import { ReferenceAreaProps } from 'recharts';

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
// Todo: add period granularity to this type
export type ViewContent = {
  chartType: ChartTypes;
  valueType?: ValueType;
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
  chartConfig?: BaseChartConfig;
  presentationOptions?: object;
  renderLegendForOneItem?: boolean;
  referenceAreas?: ReferenceAreaProps[];
};

export type ValueType =
  | 'boolean'
  | 'fractionAndPercentage'
  | 'percentage'
  | 'text'
  | 'number'
  | 'color'
  | 'currency'
  | 'view'
  | 'oneDecimalPlace'
  | 'fraction';
