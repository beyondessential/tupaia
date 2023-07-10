import { VALUE_TYPES } from '@tupaia/utils';
import { IconKey } from '../components';
import { ColorScheme } from '../utils';
import { MeasureType, OrgUnitCode, ScaleType } from './types';

const ValueTypes = { ...VALUE_TYPES } as const;
export type Value = string | number | null | undefined;

export type SeriesValue = {
  value: Value | Value[];
  name: string;
  hideFromLegend?: boolean;
  icon?: IconKey;
  color: string;
  label?: string;
  hideFromPopup?: boolean;
};

export type SeriesValueMapping = {
  null: SeriesValue;
  [key: string]: SeriesValue;
};

export type BaseSeries = {
  name: string;
  key: string;
  values: SeriesValue[];
  valueMapping: SeriesValueMapping;
  hideFromLegend?: boolean;
  type: MeasureType;
  hideByDefault?: Record<string, boolean>;
  displayedValueKey?: string;
  color: string;
  radius?: number;
  hideFromPopup?: boolean;
  metadata: object;
  organisationUnit?: OrgUnitCode;
  sortOrder: number;
  popupHeaderFormat?: string;
  valueType?: ValueOf<typeof ValueTypes>;
  startDate: string;
  endDate: string;
};

export type MarkerSeries = BaseSeries & {
  icon?: IconKey;
};

export type SpectrumSeries = BaseSeries & {
  scaleColorScheme: ColorScheme;
  min: number;
  max: number;
  scaleType: ScaleType;
  dataKey?: string;
  noDataColour?: string;
  scaleBounds?: {
    left: number;
    right: number;
  };
};

export type Series = MarkerSeries & SpectrumSeries;
