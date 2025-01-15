import { CssColor } from '../../../css';
import { DashboardItemType } from '../../common';
import { BaseConfig, ValueType } from '../common';

export type BaseViewConfig = BaseConfig & {
  type: `${DashboardItemType.View}`;
  viewType: string;
  valueType?: ValueType;
  value_metadata?: Record<string, unknown>;
};

export type ColorOption = {
  color: CssColor;
};
