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

export type DateOffsetSpec = {
  /**
   * @description Time unit to offset by
   */
  unit: PeriodUnit;

  /**
   * @description Offset distance (can be negative to offset to an earlier date)
   */
  offset?: number;

  /**
   * @description Used to modify the offset by either moving the date to the start/end of the modifier unit
   */
  modifier?: OffsetModifier;

  /**
   * @description Time unit to modify the offset by
   */
  modifierUnit?: PeriodUnit;
};

enum OffsetModifier {
  start_of = 'start_of',
  end_of = 'end_of',
}

export type PeriodUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type DefaultTimePeriod =
  | DateOffsetSpec
  | {
      /**
       * @description Either an ISO Date string, or an offset object
       */
      start?: string | DateOffsetSpec;

      /**
       * @description Either an ISO Date string, or an offset object
       */
      end?: string | DateOffsetSpec;
    };

/**
 * One of the two shapes which {@link ReferenceProps} can take.
 *
 * @see LinkReferenceProps
 * @see ReferenceProps
 */
export interface PlaintextReferenceProps {
  text: string;
  name?: never;
  link?: never;
}

/**
 * One of the two shapes which {@link ReferenceProps} can take.
 *
 * @see PlaintextReferenceProps
 * @see ReferenceProps
 */
export interface LinkReferenceProps {
  text?: never;
  name: string;
  link: string;
}

/**
 * Props for the reference prop of the `ReferenceTooltip` ui-component. It can have either a piece
 * of plaintext to display in the tooltip, or a named link; but not both.
 */
export type ReferenceProps = PlaintextReferenceProps | LinkReferenceProps;

export enum DashboardItemType {
  View = 'view',
  Chart = 'chart',
  Matrix = 'matrix',
  Component = 'component',
}
export type EntityAttributes = Record<string, unknown> & {
  type?: string;
};

export interface EntityMetadata {
  dhis?: {
    dhisInstanceCode?: string;
    isDataRegional?: boolean;
    push?: boolean;
    trackedEntityId?: string;
  };
  ms1?: { distributionId?: string };
  openStreetMaps?: { id?: string };
}
