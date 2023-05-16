/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export interface DataProps {
  name: string;
  value: string;
  timestamp?: string;
}

export interface ViewContent {
  name?: string;
  xName?: string;
  periodGranularity?: string;
  valueType?: string;
  labelType?: string;
  chartType?: string;
  data?: DataProps[];
  chartConfig?: object;
}
