import { IconKey } from '../components';
import { SCALE_TYPES, MEASURE_TYPES } from '../constants';

export type ValueType = string | number | null | undefined;
export type ScaleType = `${SCALE_TYPES}`;
export type MeasureType = `${MEASURE_TYPES}`;

export type LegendItemValue = {
  value: ValueType;
  name: string;
  hideFromLegend?: boolean;
  icon?: IconKey;
  color: string;
};

export type ValueMappingType = {
  null: LegendItemValue;
  [key: string]: LegendItemValue;
};

export type BaseLegendSeriesItem = {
  name: string;
  key: string;
  type: string;
  values: LegendItemValue[];
  valueMapping: ValueMappingType;
  hideFromLegend?: boolean;
  type: MeasureType;
};

export type MarkerLegendSeriesItem = BaseLegendSeriesItem & {
  icon?: IconKey;
};

export type SpectrumLegendSeriesItem = BaseLegendSeriesItem & {
  scaleColorScheme: object;
  min: number;
  max: number;
  scaleType: ScaleType;
  valueType: string;
  dataKey?: string;
  noDataColour?: string;
};
export type LegendSeriesItem = MarkerLegendSeriesItem & SpectrumLegendSeriesItem;
export type LegendProps = {
  setValueHidden: (dataKey?: string, value: ValueType, hidden: boolean) => void;
  hiddenValues: Record<string, Record<string, boolean>>;
};

export type MarkerLegendProps = LegendProps & {
  series: MarkerLegendSeriesItem;
  hasIconLayer: boolean;
  hasRadiusLayer: boolean;
  hasColorLayer: boolean;
};

export type SpectrumLegendProps = LegendProps & {
  series: SpectrumLegendSeriesItem;
};
