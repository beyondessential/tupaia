import { DataValueType, MarkerSeriesItem, SpectrumSeriesItem } from './data-types';

export type LegendProps = {
  setValueHidden: (dataKey?: string, value: DataValueType, hidden: boolean) => void;
  hiddenValues: Record<string, Record<string, boolean>>;
};

export type MarkerLegendProps = LegendProps & {
  series: MarkerSeriesItem;
  hasIconLayer: boolean;
  hasRadiusLayer: boolean;
  hasColorLayer: boolean;
};

export type SpectrumLegendProps = LegendProps & {
  series: SpectrumSeriesItem;
};
