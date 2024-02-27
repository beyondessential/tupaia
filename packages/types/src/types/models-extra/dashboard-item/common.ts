/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DateOffsetSpec, PeriodUnit, VizPeriodGranularity } from '../common';

export type BaseConfig = {
  /**
   * @description The title of the viz
   */
  name: string;

  /**
   * @description A short description that appears above a viz
   */
  description?: string;

  /**
   * @description Granularity of dates in the viz. Controls the date picker and x axis granularity
   */
  periodGranularity?: `${VizPeriodGranularity}`;

  /**
   * @description Initial date range for this viz
   */
  defaultTimePeriod?: DefaultTimePeriod;

  /**
   * @description Maximum date ranges that the date picker can be used to choose from
   */
  datePickerLimits?: {
    start?: DateOffsetSpec;
    end?: DateOffsetSpec;
  };

  /**
   * @description Extra config options for exporting
   */
  exportConfig?: {
    /**
     * @description Sets the header for the data element in xls exports
     */
    dataElementHeader?: string;
  };

  /**
   * @description Message which shows if no data is found
   */
  noDataMessage?: string;

  /**
   * @description If true, Tupaia will not fetch any data for this viz. Usually used with custom vizes of type: component, e.g. ProjectDescription.
   * @default false
   */
  noDataFetch?: boolean;

  /**
   * @description Configure drill down functionality in this viz to allow clicking through to another visual
   */
  drillDown?: {
    /**
     * @description The code of the dashboard item that drilling down through this viz should take you to
     */
    itemCode?: string;
    keyLink?: string;

    /**
     * @description Parameter that the value which is drilled through should link to when fetching data for the drill down dashboard item
     */
    parameterLink?: string;

    /**
     * @description A map of series codes to dashboard item codes that drilling down each series should take you to
     */
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
   * @description Allows customising how weeks are displayed, e.g. 'W/C 6 Jan 2020' or 'ISO Week 2 2020'
   * @default 'WEEK_COMMENCING_ABBR'
   */
  weekDisplayFormat?: WeekDisplayFormat;
};

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

export enum WeekDisplayFormat {
  WEEK_COMMENCING_ABBR = 'WEEK_COMMENCING_ABBR',
  WEEK_COMMENCING = 'WEEK_COMMENCING',
  WEEK_ENDING_ABBR = 'WEEK_ENDING_ABBR',
  WEEK_ENDING = 'WEEK_ENDING',
  ISO_WEEK_NUMBER = 'ISO_WEEK_NUMBER',
}

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

export type ExportPresentationOptions = {
  /**
   * @description Include labels for each point of data in exports
   */
  exportWithLabels?: boolean;

  /**
   * @description Include the data table below the viz in exports
   */
  exportWithTable?: boolean;

  /**
   * @description Set to 'true' to prevent users from exporting this viz with the data table
   */
  exportWithTableDisabled?: boolean;
};
