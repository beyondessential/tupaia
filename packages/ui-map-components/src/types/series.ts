/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import {
  ColorMapOverlayConfig,
  IconMapOverlayConfig,
  InlineValue,
  MapOverlayConfig,
  RadiusMapOverlayConfig,
  ShadingMapOverlayConfig,
  SpectrumMapOverlayConfig,
} from '@tupaia/types';
import { OrgUnitCode } from './types';

export type SeriesValue = InlineValue & {
  label?: string;
};

export type SeriesValueMapping = {
  null: SeriesValue;
  [key: string]: SeriesValue;
};

export type BaseSeries = Pick<
  MapOverlayConfig,
  'hideFromLegend' | 'hideByDefault' | 'displayedValueKey' | 'hideFromPopup' | 'valueType'
> & {
  name: string;
  key: string;
  values: SeriesValue[];
  valueMapping: SeriesValueMapping;
  color: string;
  metadata: object;
  organisationUnit?: OrgUnitCode;
  sortOrder: number;
  popupHeaderFormat?: string;
  startDate: string;
  endDate: string;
  hideFromTable?: boolean;
};

export type RadiusSeries = BaseSeries & {
  radius: number;
  type: RadiusMapOverlayConfig['displayType'];
};

export type IconSeries = BaseSeries & {
  type: IconMapOverlayConfig['displayType'];
  icon: IconMapOverlayConfig['icon'];
};

export type SpectrumSeries = BaseSeries &
  Pick<
    SpectrumMapOverlayConfig,
    'scaleType' | 'scaleBounds' | 'noDataColour' | 'scaleColorScheme'
  > & {
    min: number;
    max: number;
    dataKey?: string;
    type: SpectrumMapOverlayConfig['displayType'];
  };

export type ColorSeries = BaseSeries & {
  type: ColorMapOverlayConfig['displayType'];
};

export type ShadingSeries = BaseSeries & {
  type: ShadingMapOverlayConfig['displayType'];
};

export type PopupOnlySeries = BaseSeries & {
  type: 'popup-only';
};

export type Series =
  | SpectrumSeries
  | RadiusSeries
  | IconSeries
  | ColorSeries
  | ShadingSeries
  | PopupOnlySeries;

export type MarkerSeries =
  | RadiusSeries
  | IconSeries
  | ColorSeries
  | ShadingSeries
  | PopupOnlySeries;
