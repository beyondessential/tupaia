import { DateOffsetSpec, DefaultTimePeriod, ReferenceProps, VizPeriodGranularity } from '../common';

export type DatePickerOffsetSpec = {
  unit: 'month' | 'quarter';
  offset: number;
};

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
   * @description The number of periods to offset the date range by, for single date period granularities. E.g. if the period granularity is 'one_year_at_a_time' and the date offset is 6 months, the year will run from July-June. Only months and quarter offsets are supported.
   * Currently only works for 'one_year_at_a_time' and 'year' granularities -  assume that any other granularities used with this will not work as expected.
   */
  dateOffset?: DatePickerOffsetSpec;

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
  reference?: ReferenceProps;

  /**
   * @description If specified allows the frontend to know where the data is coming from, so if there is no data it can show a custom no-data message e.g. "Requires mSupply".
   */
  source?: 'dhis' | 'mSupply' | string;

  /**
   * @description Allows customising how weeks are displayed, e.g. 'W/C 6 Jan 2020' or 'ISO Week 2 2020'
   * @default 'WEEK_COMMENCING_ABBR'
   */
  weekDisplayFormat?: WeekDisplayFormat;

  /**
   * @description If specified, this delimiter will be used to separate the start and end dates in the date range picker. Defaults to '-'. This only applies to dates when the type is a single date but has an offset. E.g. offset of 6 months with a date range delimiter of '/' will show 'Jul 2022/June 2023'
   */

  dateRangeDelimiter?: string;
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
