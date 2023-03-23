/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { BaseConfig } from './common';
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
  categoryPresentationOptions?: any;
};

type PresentationOptions = {
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

type PresentationOptionCondition = {
  key: string;
  color?: CssColor;
  label?: string;
  description?: string;
  /**
   * @description the value to match against exactly, or an object with match criteria e.g. { '>=': 5.5 }
   */
  condition: ConditionValue | Record<ConditionType, ConditionValue>;
  legendLabel?: string;
};

type ConditionValue = string | number;

enum ConditionType {
  '=' = '=',
  '>' = '>',
  '<' = '<',
  '>=' = '>=',
  '<=' = '<=',
}
