/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useEffect } from 'react';
import moment from 'moment';
import {
  constrainDate,
  DEFAULT_MIN_DATE,
  formatDateForApi,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  momentToDateString,
  roundStartEndDates,
  roundStartDate,
  roundEndDate,
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
 * @param isSingleDate
 * @param granularity
 * @param minMomentDate
 * @param maxMomentDate
 * @returns {{defaultEndDate: moment.Moment, defaultStartDate: moment.Moment}}
 */
const getDefaultDates = (isSingleDate, granularity, minMomentDate, maxMomentDate) => {
  const defaultStartDate = isSingleDate
    ? constrainDate(moment(), minMomentDate, maxMomentDate)
    : minMomentDate;

  const defaultEndDate = isSingleDate ? defaultStartDate : maxMomentDate;

  return {
    defaultStartDate: roundStartDate(granularity, defaultStartDate),
    defaultEndDate: roundEndDate(granularity, defaultEndDate),
  };
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
 * @param min
 * @param max
 * @param granularity
 * @param onSetDates
 * @returns {{handleReset: handleReset, handleDateChange: handleDateChange, nextDisabled: boolean, labelText: (*|string), isSingleDate: boolean, currentStartDate: (*|moment.Moment), currentEndDate: (*|moment.Moment), prevDisabled: boolean, minMomentDate: moment.Moment, changePeriod: changePeriod, maxMomentDate: moment.Moment}}
 */
export const useDatePickerDates = ({ startDate, endDate, min, max, granularity, onSetDates }) => {
  /**
   * Call the on change handler prop using iso formatted date
   */
  const handleDateChange = (start, end) => {
    onSetDates(formatDateForApi(start), formatDateForApi(end));
  };

  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity);
  const { momentShorthand } = GRANULARITY_CONFIG[granularity];

  const minMomentDate = min ? moment(min) : moment(DEFAULT_MIN_DATE);
  const maxMomentDate = max ? moment(max) : moment();

  const { defaultStartDate, defaultEndDate } = getDefaultDates(
    isSingleDate,
    granularity,
    minMomentDate,
    maxMomentDate,
  );

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

  // set the current dates when the hook is first mounted
  useEffect(() => {
    // Prevent set dates to the same dates
    if (!(startDate && endDate)) {
      handleDateChange(currentStartDate, currentEndDate);
    }
  }, []);

  return {
    isSingleDate,
    minMomentDate,
    maxMomentDate,
    currentStartDate,
    currentEndDate,
    handleReset,
    handleDateChange,
    changePeriod,
    nextDisabled,
    prevDisabled,
    labelText,
  };
};
