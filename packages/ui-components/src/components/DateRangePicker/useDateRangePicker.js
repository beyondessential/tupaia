/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useEffect } from 'react';
import moment from 'moment';
import {
  getDefaultDates,
  DEFAULT_MIN_DATE,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  momentToDateString,
  roundStartEndDates,
  roundStartDate,
  roundEndDate,
  toStandardDateString,
} from '../Chart';

const DEFAULT_GRANULARITY = GRANULARITY_CONFIG[GRANULARITIES.DAY];

/**
 *
 * @param isSingleDate
 * @param granularity
 * @param startDate
 * @param endDate
 * @returns {*|string}
 */
const getDatesAsString = (isSingleDate, granularity, startDate, endDate) => {
  const { rangeFormat } = GRANULARITY_CONFIG[granularity] || DEFAULT_GRANULARITY;
  const formattedStartDate = momentToDateString(startDate, granularity, rangeFormat);
  const formattedEndDate = momentToDateString(endDate, granularity, rangeFormat);

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
const getCurrentDates = (granularity, startDate, endDate, defaultStartDate, defaultEndDate) => ({
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
 * @returns {{handleReset: handleReset, handleDateChange: handleDateChange, nextDisabled: boolean, labelText: (*|string), isSingleDate: boolean, currentStartDate: (*|moment.Moment), currentEndDate: (*|moment.Moment), prevDisabled: boolean, changePeriod: changePeriod}}
 */
export const useDateRangePicker = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  granularity,
  onSetDates,
}) => {
  /**
   * Call the on change handler prop using iso formatted date
   */
  const handleDateChange = (newStartDate, newEndDate) => {
    onSetDates(toStandardDateString(newStartDate), toStandardDateString(newEndDate));
  };

  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity);
  const { momentShorthand } = GRANULARITY_CONFIG[granularity];

  const minMomentDate = minDate ? moment(minDate) : moment(DEFAULT_MIN_DATE);
  const maxMomentDate = maxDate ? moment(maxDate) : moment();

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates({
    periodGranularity: granularity,
  });

  const { currentStartDate, currentEndDate } = getCurrentDates(
    granularity,
    startDate,
    endDate,
    defaultStartDate,
    defaultEndDate,
  );

  const nextDisabled = currentEndDate.isSameOrAfter(maxMomentDate);
  const prevDisabled = currentStartDate.isSameOrBefore(minMomentDate);
  const labelText = getDatesAsString(isSingleDate, granularity, currentStartDate, currentEndDate);

  /**
   * Set the current date the specified number of periods forward or backwards
   * Use a negative number to set backwards
   */
  const changePeriod = numberOfPeriodsToMove => {
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
