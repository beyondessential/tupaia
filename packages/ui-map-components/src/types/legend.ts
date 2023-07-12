/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { MarkerSeries, SpectrumSeries, Value } from './series';

export type LegendProps = {
  setValueHidden: (dataKey: string, value: Value, hidden: boolean) => void;
  hiddenValues: Record<string, Record<string, boolean>>;
};

export type MarkerLegendProps = LegendProps & {
  series: MarkerSeries;
  hasIconLayer: boolean;
  hasRadiusLayer: boolean;
  hasColorLayer: boolean;
};

export type SpectrumLegendProps = LegendProps & {
  series: SpectrumSeries;
};
