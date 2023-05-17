/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useEffect } from 'react';
import moment, { Moment } from 'moment';
import {
  getDefaultDates,
  DEFAULT_MIN_DATE,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  WEEK_DISPLAY_CONFIG,
  momentToDateDisplayString,
  roundStartEndDates,
  roundStartDate,
  roundEndDate,
  toStandardDateString,
} from '@tupaia/utils';
import { GranularityType, ModifierType } from '../../types/date-picker-types';

const DEFAULT_GRANULARITY = GRANULARITIES.DAY;
/**
 *
 * @param isSingleDate
 * @param granularity
 * @param startDate
 * @param endDate
 * @param {string} weekDisplayFormat one of WEEK_DISPLAY_FORMATS
 * @returns {*|string}
 */
const getDatesAsString = (
  isSingleDate: boolean,
  granularity: GranularityType = DEFAULT_GRANULARITY,
  startDate: Moment,
  endDate: Moment,
  weekDisplayFormat?: string | number,
) => {
  const isWeek = granularity === GRANULARITIES.WEEK || granularity === GRANULARITIES.SINGLE_WEEK;
  const { rangeFormat, modifier } = (isWeek && weekDisplayFormat
    ? WEEK_DISPLAY_CONFIG[weekDisplayFormat]
    : GRANULARITY_CONFIG[granularity as keyof typeof GRANULARITY_CONFIG]) as {
    rangeFormat: string;
    modifier?: ModifierType;
  };

  const formattedStartDate = momentToDateDisplayString(
    startDate,
    granularity,
    rangeFormat,
    modifier!,
  );
  const formattedEndDate = momentToDateDisplayString(endDate, granularity, rangeFormat, modifier!);

  return isSingleDate ? formattedEndDate : `${formattedStartDate} - ${formattedEndDate}`;
};

/**
 *
 * @param granularity
 * @param startDate
 * @param endDate
 * @param defaultStartDate
 * @param defaultEndDate
 * @returns {{currentStartDate: (moment.Moment|*), currentEndDate: (moment.Moment|*)}}
 */
const getCurrentDates = (
  granularity: GranularityType,
  startDate: Moment,
  endDate: Moment,
  defaultStartDate: Moment,
  defaultEndDate: Moment,
) => ({
  currentStartDate: startDate ? roundStartDate(granularity, startDate) : defaultStartDate,
  currentEndDate: endDate ? roundEndDate(granularity, endDate) : defaultEndDate,
});

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
  startDate?: Moment;
  endDate?: Moment;
  minDate?: Moment | string;
  maxDate?: Moment | string;
  granularity?: GranularityType;
  onSetDates: (startDate: string, endDate: string) => void;
  weekDisplayFormat?: string | number;
}
export const useDateRangePicker = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  granularity,
  onSetDates,
  weekDisplayFormat,
}: UseDateRangePickerProps) => {
  /**
   * Call the on change handler prop using iso formatted date
   */
  const handleDateChange = (newStartDate: Moment | string, newEndDate: Moment | string) => {
    onSetDates(toStandardDateString(newStartDate), toStandardDateString(newEndDate));
  };

  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity ?? '');
  const {
    momentShorthand,
  }: {
    momentShorthand: string;
  } = GRANULARITY_CONFIG[granularity as keyof typeof GRANULARITY_CONFIG];

  const minMomentDate = minDate ? moment(minDate) : moment(DEFAULT_MIN_DATE);
  const maxMomentDate = maxDate ? moment(maxDate) : moment();

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates({
    periodGranularity: granularity,
  }) as {
    startDate: Moment;
    endDate: Moment;
  };

  const { currentStartDate, currentEndDate } = getCurrentDates(
    granularity!,
    startDate!,
    endDate!,
    defaultStartDate,
    defaultEndDate,
  );

  const nextDisabled = currentEndDate.isSameOrAfter(maxMomentDate);
  const prevDisabled = currentStartDate.isSameOrBefore(minMomentDate);
  const labelText = getDatesAsString(
    isSingleDate,
    granularity,
    currentStartDate,
    currentEndDate,
    weekDisplayFormat,
  );

  /**
   * Set the current date the specified number of periods forward or backwards
   * Use a negative number to set backwards
   */
  const changePeriod = (numberOfPeriodsToMove: number) => {
    if (!isSingleDate) {
      console.warn('Can only change period for single unit date pickers (e.g. one month)');
    }
    const newStartDate = currentStartDate.clone().add(numberOfPeriodsToMove, momentShorthand);
    const newEndDate = currentEndDate.clone().add(numberOfPeriodsToMove, momentShorthand);
    const { startDate: roundedStartDate, endDate: roundedEndDate } = roundStartEndDates(
      granularity,
      newStartDate,
      newEndDate,
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
    isSingleDate,
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
