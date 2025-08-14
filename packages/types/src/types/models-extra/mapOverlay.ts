import { PascalCase } from '../../utils';
import { CssColor } from '../css';
import { EntityType } from './entityType';
import { DateOffsetSpec, DefaultTimePeriod, ReferenceProps, VizPeriodGranularity } from './common';
import { EntityTypeEnum } from '../models';

/**
 * @description A key that can be used to reference a value in a measureConfig, or to reference all values
 */
type ValueKey = string | '$all';

export type InlineValue = {
  color?: string;

  /**
   * @description Whether to hide this value from the legend
   */
  hideFromLegend?: boolean;

  /**
   * @description Whether to hide this value from the popup/tooltip
   */
  hideFromPopup?: boolean;

  /**
   * @description What icon to use for this value
   */
  icon?: IconKey;

  /**
   * @description Display name for this value
   */
  name?: string;

  /**
   * @description The value (use 'null' to configure the behaviour for 'No data')
   * @nullable Need to add this for the JSON schema to include "null" as a valid type
   */
  value: string | number | null;
};

type MeasureConfig = {
  /**
   * @description How to display this series (popup-only is deprecated)
   */
  type: `${MeasureType}` | 'popup-only';

  /**
   * @description Level of the entity hierarchy that this map overlay has data for
   */
  measureLevel?: EntityLevel;

  /**
   * @description Level of the entity hierarchy that this map overlay has data for
   */
  values?: InlineValue[];

  /**
   * @description Order to show this series in the popup/tooltip
   */
  sortOrder?: number;

  /**
   * @description Whether to include this series in the legend
   */
  hideFromLegend?: boolean;

  /**
   * @description Whether to include this series in the popup/tooltip
   */
  hideFromPopup?: boolean;

  /**
   * @description Whether to include this series in the table
   */
  hideFromTable?: boolean;

  /**
   * @description Display name of this series
   */
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

type EntityLevel = PascalCase<EntityTypeEnum> | EntityType;

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
  GPI = 'gpi',
}

export type BaseMapOverlayConfig = {
  /**
   * @description Override the map overlay name
   */
  customLabel?: string | null;

  /**
   * @description Maximum date ranges that the date picker can be used to choose from
   */
  datePickerLimits?: {
    start?: DateOffsetSpec;
    end?: DateOffsetSpec;
  };

  /**
   * @description
   * Initial date range for this viz.
   * Either a single offset, or an ISO string / offset for start/end date
   * eg.
   * // Single offset
   * "defaultTimePeriod": {
   *   "unit": "week",
   *   "offset": 7
   * }
   *
   * // Explicit start/end dates
   * "defaultTimePeriod": {
   *   "start": "2022-10-01",
   *   "end": "2023-06-30"
   * }
   *
   * // Start/end date offsets
   * "defaultTimePeriod": {
   *   "start": {
   *     "unit": "week",
   *     "offset": -52
   *   },
   *   "end": {
   *     "unit": "week",
   *     "offset": 3
   *   }
   * }
   */
  defaultTimePeriod?: DefaultTimePeriod;

  /**
   * @description
   * Values in the legend will be renamed if the majority of values have different 'displayValueKey'.
   * This setting disabled that behaviour.
   */
  disableRenameLegend?: boolean;

  /**
   * @description
   * This setting defines the level of the entity hierarchy from where we start rendering the map overlay.
   * Use this if we want to only render the map overlay below a certain level.
   * eg. If rendering the map overlay at the country level causes performance issues, set displayOnLevel: SubDistrict to only start rendering at Sub District
   */
  displayOnLevel?: EntityLevel;

  /**
   * @description Use to override the default column of data that we display
   */
  displayedValueKey?: DisplayedValueType;

  /**
   * @description This is keyed by the value, e.g. 'null': true, and determines whether the specific value should be hidden by default
   */
  hideByDefault?: { [key: string]: boolean };

  /**
   * @description Whether to include this map overlay in the legend
   */
  hideFromLegend?: boolean;

  /**
   * @description Whether to include this map overlay in the map overlay selector menu
   */
  hideFromMenu?: boolean;

  /**
   * @description Whether to map overlay in the popup/tooltip
   */
  hideFromPopup?: boolean;

  /**
   * @description Configure the 'i' icon information in the map overlay menu
   */
  info?: {
    reference?: ReferenceProps;
  };

  /**
   * @description Whether this map overlay supports a date picker
   */
  isTimePeriodEditable?: boolean;

  /**
   * @description This is keyed by the series, e.g. 'Not operational' and determines the configuration for that series
   */
  measureConfig?: {
    [key: ValueKey]: MeasureConfig;
  };

  /**
   * @description Level of the entity hierarchy that this map overlay has data for
   */
  measureLevel?: EntityLevel;

  /**
   * @description The colour to use when there is no data
   */
  noDataColour?: CssColor;

  /**
   * @description Granularity of dates in the viz. Controls the date picker and x axis granularity
   */
  periodGranularity?: VizPeriodGranularity;

  /**
   * @description
   * Format string for how each series should display in the popup/tooltip. Supports '{<columnName>}' as a substitute marker
   * eg. {code}: {value}
   */
  popupHeaderFormat?: string;

  /**
   * @description Data format of the data in this map overlay
   */
  valueType?: MeasureValueType;

  /**
   * @description
   * Configure display options for data values
   */
  values?: InlineValue[];
};

type CustomColors = string | null;

export type SpectrumMapOverlayConfig = BaseMapOverlayConfig & {
  scaleType: `${ScaleType}`;

  /**
   * @description What color scheme to use for the scale
   */
  scaleColorScheme?: MeasureColorScheme;

  /**
   * @description Limits on the min and max values for the scale
   */
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

  displayType: MeasureType.SPECTRUM | MeasureType.SHADED_SPECTRUM;
};

export type IconMapOverlayConfig = BaseMapOverlayConfig & {
  displayType: MeasureType.ICON;

  /**
   * @description Which icon to display for this map overlay
   */
  icon: IconKey;
};

export type RadiusMapOverlayConfig = BaseMapOverlayConfig & {
  displayType: MeasureType.RADIUS;
};

export type ColorMapOverlayConfig = BaseMapOverlayConfig & {
  displayType: MeasureType.COLOR;

  /**
   * @description A comma separated list of colours, e.g 'Green,red,Blue,cyan'
   */
  customColors?: CustomColors;

  scaleType?: ScaleType;
};

export type ShadingMapOverlayConfig = BaseMapOverlayConfig & {
  displayType: MeasureType.SHADING;

  /**
   * @description A comma separated list of colours, e.g 'Green,red,Blue,cyan'
   */
  customColors?: CustomColors;
};

export type MapOverlayConfig =
  | SpectrumMapOverlayConfig
  | IconMapOverlayConfig
  | RadiusMapOverlayConfig
  | ColorMapOverlayConfig
  | ShadingMapOverlayConfig;
