/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DateOffsetSpec, VizPeriodGranularity } from './dashboard-item/common';

export type MapOverlayConfig = {
  customColors?: string; // Comma separated string
  customLabel?: string;
  datePickerLimits?: {
    start?: DateOffsetSpec;
    end?: DateOffsetSpec;
  };
  defaultTimePeriod?: DateOffsetSpec;
  disableRenameLegend?: boolean;
  displayLevel?: EntityLevel;
  displayOnLevel?: EntityLevel;
  displayType: MeasureType;
  displayedValueKey?: DisplayedValueType;
  hideByDefault?: Record<string, boolean>;
  hideFromLegend?: boolean;
  hideFromMenu?: boolean;
  hideFromPopup?: boolean;
  icon?: IconKey;
  info?: {
    reference: {
      link?: string;
      name?: string;
      text?: string;
    };
  };
  isTimePeriodEditable?: boolean;
  // linkedMeasures?: null; // There's one record in the db that has this field and it's null
  measureConfig?: Record<
    string,
    {
      type: MeasureType;
      measureLevel?: EntityLevel;
      values?: InlineValue[];
      sortOrder?: number;
      hideFromLegend?: boolean;
    }
  >;
  measureLevel?: EntityLevel;
  name?: string;
  noDataColour?: string; // Hex code string e.g. #99237f
  periodGranularity?: VizPeriodGranularity;
  popupHeaderFormat?: string; // {code}:{name}
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
  scaleColorScheme?: MeasureColorScheme;
  scaleType?: ScaleType;
  valueType?: MeasureValueType;
  values?: InlineValue[];
};

type InlineValue = {
  color?: string;
  hideFromLegend?: boolean;
  hideFromPopup?: boolean;
  icon: IconKey;
  name: string;
  value: string | number | null;
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
  POPUP_ONLY = 'popup-only',
}

enum DisplayedValueType {
  NAME = 'name',
  ORIGINAL_VALUE = 'originalValue',
  SCHOOL_TYPE_NAME = 'schoolTypeName',
  FACILITY_TYPE_NAME = 'facilityTypeName',
}

enum EntityLevel {
  COUNTRY = 'Country',
  DISTRICT = 'District',
  SUB_DISTRICT = 'SubDistrict',
  FACILITY = 'Facility',
}

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
}

export enum MeasureColorScheme {
  DEFAULT = 'default',
  REVERSE_DEFAULT = 'default-reverse',
  PERFORMANCE = 'performance',
  TIME = 'time',
  GPI = 'gpi',
}
