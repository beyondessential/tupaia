/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useEffect } from 'react';
import moment, { Moment } from 'moment';
import { DatePickerOffsetSpec } from '@tupaia/types';
import {
  DEFAULT_MIN_DATE,
  getDefaultDates,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  momentToDateDisplayString,
  roundEndDate,
  roundStartDate,
  roundStartEndDates,
  toStandardDateString,
  WEEK_DISPLAY_CONFIG,
} from '@tupaia/utils';
import { GranularityType, ModifierType } from '../../types';

const DEFAULT_GRANULARITY = GRANULARITIES.DAY;

export const getDatesAsString = (
  isSingleDate: boolean,
  granularity: GranularityType = DEFAULT_GRANULARITY,
  startDate: Moment,
  endDate: Moment,
  weekDisplayFormat?: string | number,
  dateOffset?: DatePickerOffsetSpec,
  dateRangeDelimiter = ' – ',
) => {
  const isWeek = granularity === GRANULARITIES.WEEK || granularity === GRANULARITIES.SINGLE_WEEK;

  // when it's a single date, we use the preferred range delimiter, otherwise use the default delimiter because this indicates multiple offset dates selected
  const delimiterToUse = isSingleDate && !!dateOffset ? dateRangeDelimiter : ' – ';

  const displayGranularity = dateOffset?.unit ?? granularity;

  const { rangeFormat, modifier, momentUnit } = (
    isWeek && weekDisplayFormat
      ? WEEK_DISPLAY_CONFIG[weekDisplayFormat]
      : GRANULARITY_CONFIG[displayGranularity as keyof typeof GRANULARITY_CONFIG]
  ) as {
    // casting here because TS is inferring the types as different to the Moment types. This will probably be fixed once we use TS in the utils package
    rangeFormat: string;
    modifier?: ModifierType;
    momentUnit: moment.unitOfTime.StartOf;
  };

  // if the start and end dates are the same day, we only need to display one date
  const displayAsRange = !startDate.clone().isSame(endDate.clone(), momentUnit);

  const formattedEndDate = momentToDateDisplayString(
    endDate,
    displayGranularity,
    rangeFormat,
    modifier,
  );

  if (!displayAsRange) {
    return formattedEndDate;
  }

  const formattedStartDate = momentToDateDisplayString(
    startDate,
    displayGranularity,
    rangeFormat,
    modifier,
  );

  return `${formattedStartDate}${delimiterToUse}${formattedEndDate}`;
};

const getCurrentDates = (
  granularity: GranularityType | undefined,
  startDate: Moment | string | undefined,
  endDate: Moment | string | undefined,
  defaultStartDate: Moment,
  defaultEndDate: Moment,
): {
  currentStartDate: Moment;
  currentEndDate: Moment;
} => {
  return {
    currentStartDate: startDate ? roundStartDate(granularity, startDate) : defaultStartDate,
    currentEndDate: endDate ? roundEndDate(granularity, endDate) : defaultEndDate,
  };
};

/**
 *
 * @param startDate
 * @param endDate
 * @param minDate
 * @param maxDate
 * @param granularity
 * @param onSetDates
 * @param weekDisplayFormat
 * @returns {{handleReset: handleReset, handleDateChange: handleDateChange, nextDisabled: boolean, labelText: (*|string), isSingleDate: boolean, currentStartDate: (*|moment.Moment), currentEndDate: (*|moment.Moment), prevDisabled: boolean, changePeriod: changePeriod}}
 */

interface UseDateRangePickerProps {
  startDate?: Moment | string;
  endDate?: Moment | string;
  minDate?: Moment | string;
  maxDate?: Moment | string;
  granularity?: GranularityType;
  onSetDates: (startDate: string, endDate: string) => void;
  weekDisplayFormat?: string | number;
  dateOffset?: DatePickerOffsetSpec;
  dateRangeDelimiter?: string;
}
export const useDateRangePicker = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  granularity,
  onSetDates,
  weekDisplayFormat,
  dateOffset,
  dateRangeDelimiter,
}: UseDateRangePickerProps) => {
  /**
   * Call the on change handler prop using iso formatted date
   */
  const handleDateChange = (newStartDate: Moment | string, newEndDate: Moment | string) => {
    onSetDates(toStandardDateString(newStartDate), toStandardDateString(newEndDate));
  };

  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity ?? '');
  const { momentShorthand } = GRANULARITY_CONFIG[granularity as keyof typeof GRANULARITY_CONFIG];

  const initialMinDate = minDate ? moment(minDate) : moment(DEFAULT_MIN_DATE);

  // round the start date, including the date offset if it is set
  const minMomentDate = roundStartDate(granularity, initialMinDate, dateOffset);

  const getMaxDate = () => {
    // Get the moment object for the max date, or if it's not set, use the current date
    const initialMaxDate = maxDate ? moment(maxDate) : moment();

    // if there is no offset, just round the end date and return it
    if (!dateOffset) return roundEndDate(granularity, initialMaxDate);

    // calculate the difference between the min and max dates, and round up to the nearest whole number
    const differenceBetweenDates = Math.ceil(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - diff types are not compatible with our period momentShorthand type (which is inferred as a string)
      initialMaxDate.diff(minMomentDate, momentShorthand, true),
    );

    // add the difference between the min and max dates to the min date to get the new max date
    const newMaxDate = minMomentDate
      .clone()
      .add(differenceBetweenDates, momentShorthand)
      .subtract(1, 'days'); // subtract one day to make sure the max date is inclusive

    // round the end date, using the date offset if it is set
    const roundedEndDate = roundEndDate(dateOffset?.unit ?? granularity, newMaxDate);

    return roundedEndDate;
  };

  const maxMomentDate = getMaxDate();

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates({
    periodGranularity: granularity,
    dateOffset,
  }) as {
    startDate: Moment;
    endDate: Moment;
  };

  const displayGranularity = dateOffset ? dateOffset.unit : granularity;

  const { currentStartDate, currentEndDate } = getCurrentDates(
    displayGranularity!,
    startDate!,
    endDate!,
    defaultStartDate,
    defaultEndDate,
  );

  const nextDisabled = currentEndDate.isSameOrAfter(maxMomentDate);
  const prevDisabled = currentStartDate.isSameOrBefore(minMomentDate);

  const labelText = getDatesAsString(
    isSingleDate,
    displayGranularity,
    currentStartDate,
    currentEndDate,
    weekDisplayFormat,
    dateOffset,
    dateRangeDelimiter,
  );

  /**
   * Set the current date the specified number of periods forward or backwards
   * Use a negative number to set backwards
   */
  const changePeriod = (numberOfPeriodsToMove: number) => {
    if (!isSingleDate) {
      console.warn('Can only change period for single unit date pickers (e.g. one month)');
    }

    // If the dateOffset is set, we need to round the start and end dates to the nearest period, so that when we add the number of periods to move, we get the correct period, and can then round the start and end dates again. We shouldn't use the dates directly on the off cancel that a current date has been entered directly into the url, for example, and it doesn't match the range we want to work with.
    const startDateWithoutOffset = roundStartDate(granularity, startDate);
    const newStartDate = startDateWithoutOffset.clone().add(numberOfPeriodsToMove, momentShorthand);
    const newEndDate = newStartDate.clone();

    const { startDate: roundedStartDate, endDate: roundedEndDate } = roundStartEndDates(
      granularity,
      newStartDate,
      newEndDate,
      dateOffset,
    );

    handleDateChange(roundedStartDate, roundedEndDate);
  };

  /**
   * reset the dates to the defaults
   */
  const handleReset = () => {
    handleDateChange(defaultStartDate, defaultEndDate);
  };

  // When mounting the component, check if the initial currentDates are different from
  // the start and end dates passed to props. If they are, then trigger a date change
  useEffect(() => {
    if (!(startDate && endDate)) {
      handleDateChange(currentStartDate, currentEndDate);
    }
  }, []);

  return {
    isSingleDate: isSingleDate,
    currentStartDate: toStandardDateString(currentStartDate),
    currentEndDate: toStandardDateString(currentEndDate),
    handleReset,
    handleDateChange,
    changePeriod,
    nextDisabled,
    prevDisabled,
    labelText,
  };
};
