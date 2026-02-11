import type { CssColor } from '../../../css';
import type { DashboardItemType } from '../../common';
import type { BaseConfig, ValueType, ViewType } from '../common';

export type BaseViewConfig = BaseConfig & {
  type: DashboardItemType.View;
  viewType: ViewType;
  valueType?: ValueType;
  value_metadata?: Record<string, unknown>;
};

export type ColorOption = {
  color: CssColor;
};
