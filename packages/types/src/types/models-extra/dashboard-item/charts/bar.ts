/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { CssColor } from '../../../css';
import { CartesianChartConfig, CartesianChartPresentationOptions } from './common';

export type BarChartPresentationOptions = CartesianChartPresentationOptions & {
  color?: CssColor;
  /**
   * @description This can be anything from the [numeraljs library]{@link http://numeraljs.com/#format}
   */
  valueFormat?: string;
  referenceLines?: {
    targetLine: {
      referenceValue: number;
      referenceLabel: string;
    };
  };
};

/**
 * @description Bar Chart
 */
export type BarChartConfig = Omit<CartesianChartConfig, 'presentationOptions'> & {
  chartType: 'bar';
  presentationOptions: BarChartPresentationOptions;
};
