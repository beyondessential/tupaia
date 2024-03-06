/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { PascalCase } from '../../utils';
import { CssColor } from '../css';
import { EntityType } from '../models';
import { DateOffsetSpec, ReferenceProps, VizPeriodGranularity } from './common';

/**
 * @description A key that can be used to reference a value in a measureConfig, or to reference all values
 */
type ValueKey = string | '$all';

type DefaultTimePeriod = DateOffsetSpec & {
  start?: string | DateOffsetSpec;
  end?: string | DateOffsetSpec;
};

export type InlineValue = {
  color?: string;
  hideFromLegend?: boolean;
  hideFromPopup?: boolean;
  icon: IconKey;
  name?: string;
  value: string | number | null;
};

type MeasureConfig = {
  type: `${MeasureType}` | 'popup-only';
  measureLevel?: EntityLevel;
  values?: InlineValue[];
  sortOrder?: number;
  hideFromLegend?: boolean;
  name?: string;
  color?: CssColor;
};

export enum IconKey {
  PIN = 'pin',
  UP_ARROW = 'upArrow',
  RIGHT_ARROW = 'rightArrow',
  DOWN_ARROW = 'downArrow',
  HEALTH_PIN = 'healthPin',
  CIRCLE = 'circle',
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  PENTAGON = 'pentagon',
  RADIUS = 'radius',
  RING = 'ring',
  H = 'h',
  X = 'x',
  EMPTY = 'empty',
  FADE = 'fade',
  WARNING = 'warning',
  HELP = 'help',
  CHECKBOX = 'checkbox',
  HIDDEN = 'hidden',
}

export enum ScaleType {
  PERFORMANCE = 'performance',
  PERFORMANCE_DESC = 'performanceDesc',
  NEUTRAL = 'neutral',
  NEUTRAL_REVERSE = 'neutralReverse',
  TIME = 'time',
  GPI = 'gpi',
}

export enum MeasureType {
  ICON = 'icon',
  COLOR = 'color',
  RADIUS = 'radius',
  SPECTRUM = 'spectrum',
  SHADING = 'shading',
  SHADED_SPECTRUM = 'shaded-spectrum',
}

enum DisplayedValueType {
  NAME = 'name',
  ORIGINAL_VALUE = 'originalValue',
  SCHOOL_TYPE_NAME = 'schoolTypeName',
  FACILITY_TYPE_NAME = 'facilityTypeName',
}

type EntityLevel = PascalCase<keyof typeof EntityType>;

enum MeasureValueType {
  BOOLEAN = 'boolean',
  CURRENCY = 'currency',
  FRACTION = 'fraction',
  PERCENTAGE = 'percentage',
  FRACTION_AND_PERCENTAGE = 'fractionAndPercentage',
  NUMBER_AND_PERCENTAGE = 'numberAndPercentage',
  TEXT = 'text',
  NUMBER = 'number',
  ONE_DECIMAL_PLACE = 'oneDecimalPlace',
  DEFAULT = 'default',
}

export enum MeasureColorScheme {
  DEFAULT = 'default',
  REVERSE_DEFAULT = 'default-reverse',
  PERFORMANCE = 'performance',
  TIME = 'time',
  GPI = 'gpi',
}

export type BaseMapOverlayConfig = {
  customLabel?: string | null;
  datePickerLimits?: {
    start?: DateOffsetSpec;
    end?: DateOffsetSpec;
  };
  defaultTimePeriod?: DefaultTimePeriod;
  disableRenameLegend?: boolean;
  displayLevel?: EntityLevel;
  displayOnLevel?: EntityLevel;
  displayedValueKey?: DisplayedValueType;
  /**
   * @description This is keyed by the value, e.g. 'null': true, and determines whether the specific value should be hidden by default
   */
  hideByDefault?: Record<string, boolean>;
  hideFromLegend?: boolean;
  hideFromMenu?: boolean;
  hideFromPopup?: boolean;
  info?: {
    reference?: ReferenceProps;
  };
  isTimePeriodEditable?: boolean;
  /**
   * @description This is keyed by the value, e.g. 'Not operational' and determines the configuration for that value
   */
  measureConfig?: Record<ValueKey, MeasureConfig>;
  measureLevel?: EntityLevel;
  name?: string;
  /**
   * @description The colour to use when there is no data
   */
  noDataColour?: CssColor;
  periodGranularity?: VizPeriodGranularity;
  popupHeaderFormat?: '"{code}: {name}"' | null;
  scaleBounds?: {
    left?: {
      min: number | 'auto';
      max: number | 'auto';
    };
    right?: {
      min: number | 'auto';
      max: number | 'auto';
    };
  };
  valueType?: MeasureValueType;
  values?: InlineValue[];
};

/**
 * @description A comma separated list of colours, e.g 'Green,red,Blue,cyan'
 */
type CustomColors = string | null;

export type SpectrumMapOverlayConfig = BaseMapOverlayConfig & {
  scaleType: `${ScaleType}`;
  scaleColorScheme: MeasureColorScheme;
  displayType: MeasureType.SPECTRUM | MeasureType.SHADED_SPECTRUM;
};

export type IconMapOverlayConfig = BaseMapOverlayConfig & {
  displayType: MeasureType.ICON;
  icon: IconKey;
};

export type RadiusMapOverlayConfig = BaseMapOverlayConfig & {
  displayType: MeasureType.RADIUS;
};

export type ColorMapOverlayConfig = BaseMapOverlayConfig & {
  displayType: MeasureType.COLOR;
  customColors?: CustomColors;
  scaleType?: ScaleType;
};

export type ShadingMapOverlayConfig = BaseMapOverlayConfig & {
  displayType: MeasureType.SHADING;
  customColors?: CustomColors;
};

export type MapOverlayConfig =
  | SpectrumMapOverlayConfig
  | IconMapOverlayConfig
  | RadiusMapOverlayConfig
  | ColorMapOverlayConfig
  | ShadingMapOverlayConfig;
