/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { BaseConfig, ExportPresentationOptions } from './common';
import { CssColor } from '../../css';

/**
 * @description Matrix viz type
 */
export type MatrixConfig = BaseConfig & {
  type: 'matrix';

  /**
   * @description Matrix viz type can specify a column as the data element column.
   */
  dataElementColumnTitle?: string;

  /**
   * @description Like it sounds
   */
  hideColumnTitles?: boolean;

  /**
   * @description Allows for conditional styling
   */
  presentationOptions?: PresentationOptions;

  /**
   * @description Category header rows can have values just like real rows, this is how you style them
   */
  categoryPresentationOptions?: PresentationOptions;
  /**
   * @description Specify the valueType for formatting of the value in the matrix
   */
  valueType?: 'string';
};

export type ConditionalPresentationOptions = {
  type?: 'condition'; // optional key it seems like
  conditions?: PresentationOptionCondition[];
  /**
   * @default false
   */
  showRawValue?: boolean;
  /**
   * @default false
   */
  showNestedRows?: boolean;
  /**
   * @description Specify if you want to limit where to apply the conditional presentation
   */
  applyLocation?: {
    columnIndexes: number[];
  };
};

export type RangePresentationOptions = Record<CssColor, PresentationOptionRange> & {
  type: 'range';
  showRawValue?: boolean;
};

export type PresentationOptions = ExportPresentationOptions &
  (ConditionalPresentationOptions | RangePresentationOptions);

type BasePresentationOption = {
  /**
   * @description Specify the color of the display item
   */
  color?: CssColor;
  /**
   * @description Specify the text for the legend item. Also used in the enlarged cell view
   */
  description?: string;
  /**
   * @description Specify if you want a label to appear above the enlarged
   */
  label?: string;
};
export type PresentationOptionCondition = BasePresentationOption & {
  key: string;
  /**
   * @description the value to match against exactly, or an object with match criteria e.g. { '>=': 5.5 }
   */
  condition: ConditionValue | Record<ConditionType, ConditionValue>;
  legendLabel?: string;
};

export type PresentationOptionRange = BasePresentationOption & {
  min?: number;
  max?: number;
};

export type ConditionValue = string | number;

export enum ConditionType {
  '=' = '=',
  '>' = '>',
  '<' = '<',
  '>=' = '>=',
  '<=' = '<=',
}
