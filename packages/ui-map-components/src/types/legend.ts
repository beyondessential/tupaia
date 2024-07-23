/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { MarkerSeries, SeriesValue, SpectrumSeries } from './series';

export type LegendProps = {
  setValueHidden: (dataKey: string, value: SeriesValue['value'], hidden: boolean) => void;
  hiddenValues: Record<string, Record<string, boolean>>;
  isExport?: boolean;
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
