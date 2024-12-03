/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { CssColor } from '../../css';
import { DashboardItemType } from '../common';
import type { BaseConfig, ValueType } from './common';

/**
 * @description Matrix viz type
 */
export type MatrixConfig = BaseConfig & {
  type: `${DashboardItemType.Matrix}`;

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
  presentationOptions?: MatrixPresentationOptions;

  /**
   * @description Category header rows can have values just like real rows, this is how you style them
   */
  categoryPresentationOptions?: MatrixPresentationOptions;
  /**
   * @description Specify the valueType for formatting of the value in the matrix
   */
  valueType?: ValueType;
  /**
   * @description A url to an image to be used when a matrix is collapsed.
   */
  placeholder?: string;
  /**
   * @description Specify whether to show search filters on the matrix
   */
  enableSearch?: boolean;
};

export type MatrixEntityCell = { entityCode: string; entityLabel: string };

export type MatrixVizBuilderConfig = MatrixConfig & {
  /**
   * @description Configuration for rows, columns, and categories of the matrix
   */
  output?: {
    type: 'matrix';

    /**
     * @description The column of the data-table that should be used for the row values in the matrix
     */
    rowField: string;

    /**
     * @description The column of the data-table that should be used to group the rows into categories
     */
    categoryField?: string;

    /**
     * @description
     * The columns of the data-table that should be included as columns in the matrix.
     * Can be either:
     * a list of column names,
     * '*' to indicate all columns
     * or a list of objects with an entityCode and entityLabel to generate entity links
     */
    columns?: string | string[] | MatrixEntityCell[];
  };
};

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

export type PresentationOptionCondition = BasePresentationOption & {
  key: string;
  /**
   * @description the value to match against exactly, or an object with match criteria e.g. { '>=': 5.5 }
   */
  condition: ConditionValue | ConditionsObject;
  legendLabel?: string;
};

export type PresentationOptionRange = BasePresentationOption & {
  min?: number;
  max?: number;
};

export type ConditionsObject = { [key in ConditionType]?: ConditionValue };

export type ConditionValue = string | number;

export enum ConditionType {
  '=' = '=',
  '>' = '>',
  '<' = '<',
  '>=' = '>=',
  '<=' = '<=',
}

export type MatrixPresentationOptions = ConditionalPresentationOptions | RangePresentationOptions;
