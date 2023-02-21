/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export type BaseConfig = {
  name: string;

  /**
   * @description A short description that appears above a viz
   */
  description?: string;

  /**
   * @description A url to an image to be used when a viz is collapsed. Some vizes display small, others display a placeholder.
   */
  placeholder?: string;

  periodGranularity?: VizPeriodGranularity;

  defaultTimePeriod?: DefaultTimePeriod;

  datePickerLimits?: {
    start?: DateOffsetSpec;
    end?: DateOffsetSpec;
  };

  /**
   * @description Extra config options for exporting
   */
  exportConfig?: any;

  /**
   * @description Message which shows if no data is found
   */
  noDataMessage?: string;

  /**
   * @description If true, Tupaia will not fetch any data for this viz. Usually used with custom vizes of type: component, e.g. ProjectDescription.
   * @default false
   */
  noDataFetch?: boolean;

  drillDown?: {
    keyLink?: string;
    itemCode?: string;
    parameterLink?: string;
    itemCodeByEntry?: {
      [key: string]: string;
    };
  };

  /**
   * @description
   */
  entityHeader?: string;

  /**
   * @description If provided shows an (i) icon next to the viz title, which allows linking to the source data
   */
  reference?: {
    /**
     * @description url
     */
    link: string;
    /**
     * @description label
     */
    name: string;
  };

  /**
   * @description If specified allows the frontend to know where the data is coming from, so if there is no data it can show a custom no-data message e.g. "Requires mSupply".
   */
  source?: 'dhis' | 'mSupply' | string;

  /**
   * @description If specified will only show this viz if the conditions are met against the current Entity.
   */
  displayOnEntityConditions?: DisplayOnEntityConditions;
};

export enum VizPeriodGranularity {
  'DAY' = 'day',
  'SINGLE_DAY' = 'one_day_at_a_time',
  'WEEK' = 'week',
  'SINGLE_WEEK' = 'one_week_at_a_time',
  'MONTH' = 'month',
  'SINGLE_MONTH' = 'one_month_at_a_time',
  'QUARTER' = 'quarter',
  'SINGLE_QUARTER' = 'one_quarter_at_a_time',
  'YEAR' = 'year',
  'SINGLE_YEAR' = 'one_year_at_a_time',
}

export type ValueType =
  | 'boolean'
  | 'fractionAndPercentage'
  | 'percentage'
  | 'text'
  | 'number'
  | 'color'
  | 'currency'
  | 'view'
  | 'oneDecimalPlace'
  | 'fraction';

type PeriodUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';

type DefaultTimePeriod =
  | DefaultTimePeriodShort
  | DefaultTimePeriodLong
  | DefaultTimePeriodWithAbsoluteDate;

type DefaultTimePeriodShort = { offset: number; unit: PeriodUnit };

type DefaultTimePeriodLong = {
  start: DateOffsetSpec;
  end: DateOffsetSpec;
};

type DefaultTimePeriodWithAbsoluteDate = {
  /**
   * @description ISO Date Time
   */
  start: string;
};

type DateOffsetSpec = {
  unit: PeriodUnit;
  offset: number;
  modifier?: OffsetModifier;
  modifierUnit?: PeriodUnit;
};

enum OffsetModifier {
  start_of = 'start_of',
  end_of = 'end_of',
}

type DisplayOnEntityConditions =
  | DisplayOnEntityAttributeConditions
  | DisplayOnEntityOtherConditions;
type DisplayOnEntityAttributeConditions = {
  attributes: {
    [key: string]: string | number | boolean;
  };
};
type DisplayOnEntityOtherConditions = {
  [key: string]: string | number | boolean;
};
