/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Moment } from 'moment';
import { MenuItem } from '../Inputs';
import { DatePicker } from './DatePicker';
import { YearPickerProps } from '../../types';
import {
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  roundEndDate,
  roundStartDate,
} from '@tupaia/utils';
import { getDatesAsString } from './useDateRangePicker';

const getOffsetStartDateForYear = (
  year: number,
  momentDateValue: YearPickerProps['momentDateValue'],
  granularity: YearPickerProps['granularity'],
  dateOffset: YearPickerProps['dateOffset'],
) => {
  if (!dateOffset) {
    return year;
  }

  return roundStartDate(granularity, momentDateValue.clone().year(year), dateOffset);
};

const getOffsetEndDateForYear = (
  year: number,
  offsetStartDate: Moment,
  momentDateValue: YearPickerProps['momentDateValue'],
  granularity: YearPickerProps['granularity'],
  dateOffset: YearPickerProps['dateOffset'],
) => {
  if (!dateOffset) {
    return year;
  }

  const isSetRangeGranularity = GRANULARITIES_WITH_ONE_DATE.includes(granularity);

  if (isSetRangeGranularity) {
    const { momentUnit } = GRANULARITY_CONFIG[granularity as keyof typeof GRANULARITY_CONFIG];
    return offsetStartDate
      .clone()
      .add(1, momentUnit as any)
      .subtract(1, 'minute'); // set to the end of the day at the end of the range
  }

  return roundEndDate(granularity, momentDateValue.clone().year(year), dateOffset);
};

export const YearPicker = ({
  momentDateValue,
  minMomentDate,
  maxMomentDate,
  isIsoYear = false,
  onChange,
  dateOffset,
  granularity,
  dateRangeDelimiter,
  valueKey,
}: YearPickerProps) => {
  const isSetRangeGranularity = GRANULARITIES_WITH_ONE_DATE.includes(granularity);
  const momentToYear = (momentInstance: Moment, ...args: any[]) =>
    isIsoYear ? momentInstance.isoWeekYear(...(args as [])) : momentInstance.year(...(args as []));

  const minYear = momentToYear(minMomentDate);
  const maxYear = momentToYear(maxMomentDate);
  const yearOptions: {
    value: number;
    displayLabel: string;
    startDate: Moment;
    endDate: Moment;
  }[] = [];

  const getDisplayLabel = (year: number) => {
    // if there is no dateOffset, return the year as it is
    if (!dateOffset) return year;

    const offsetStartDate = getOffsetStartDateForYear(
      year,
      momentDateValue,
      granularity,
      dateOffset,
    );

    const offsetEndDate = getOffsetEndDateForYear(
      year,
      offsetStartDate,
      momentDateValue,
      granularity,
      dateOffset,
    );

    if (isSetRangeGranularity) {
      return getDatesAsString(
        true,
        dateOffset.unit,
        offsetStartDate,
        offsetEndDate,
        undefined,
        dateOffset,
        dateRangeDelimiter,
      );
    }

    if (valueKey === 'startDate') {
      return getDatesAsString(
        true,
        dateOffset.unit,
        offsetStartDate,
        offsetStartDate,
        undefined,
        dateOffset,
        dateRangeDelimiter,
      );
    }

    return getDatesAsString(
      true,
      dateOffset.unit,
      offsetEndDate,
      offsetEndDate,
      undefined,
      dateOffset,
      dateRangeDelimiter,
    );
  };

  for (let y = minYear; y <= maxYear; y++) {
    const displayLabel = getDisplayLabel(y);
    const startDate = getOffsetStartDateForYear(y, momentDateValue, granularity, dateOffset);
    const endDate = getOffsetEndDateForYear(y, startDate, momentDateValue, granularity, dateOffset);
    const yearToUse = valueKey === 'startDate' ? startDate : endDate;
    yearOptions.push({
      value: yearToUse.year(),
      displayLabel,
      startDate,
      endDate,
    });
  }

  const menuItems = yearOptions.map(option => (
    <MenuItem key={option.value} value={option.value}>
      {option.displayLabel}
    </MenuItem>
  ));

  const onChangeValue = e => {
    return onChange(momentToYear(momentDateValue.clone(), e.target.value));
  };

  const getSelectedOption = () => {
    if (!dateOffset) {
      return momentToYear(momentDateValue);
    }

    const applicableOption = yearOptions.find(option => {
      const { startDate, endDate } = option;
      if (valueKey === 'startDate') {
        return startDate.isSame(momentDateValue, 'year');
      }

      return momentDateValue.isBetween(startDate, endDate, 'year', '[]');
    });
    if (!applicableOption) return undefined;

    return applicableOption[valueKey].year();
  };
  const selectedOption = getSelectedOption();

  return (
    <DatePicker
      label="Year"
      selectedValue={selectedOption}
      onChange={onChangeValue}
      menuItems={menuItems}
    />
  );
};
