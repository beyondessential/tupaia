/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Moment } from 'moment';
import { roundEndDate, roundStartDate } from '@tupaia/utils';
import { YearPickerProps } from '../../types';
import { MenuItem } from '../Inputs';
import { DatePicker } from './DatePicker';
import { getDatesAsString } from './useDateRangePicker';

export const YearPicker = ({
  momentDateValue,
  minMomentDate,
  maxMomentDate,
  isIsoYear = false,
  onChange,
  dateOffset,
  granularity,
  dateRangeDelimiter,
}: YearPickerProps) => {
  const momentToYear = (momentInstance: Moment, ...args: any[]) =>
    isIsoYear ? momentInstance.isoWeekYear(...(args as [])) : momentInstance.year(...(args as []));

  const yearOptions = [];

  const offsetMinDate = roundStartDate(granularity, minMomentDate, dateOffset);

  const offsetMaxDate = roundEndDate(granularity, maxMomentDate, dateOffset);

  const yearsToDisplay = offsetMaxDate.clone().diff(offsetMinDate, 'years');

  for (let y = 0; y <= yearsToDisplay; y++) {
    const startDate = offsetMinDate.clone().add(y, 'years');
    const endDate = startDate.clone().add(1, 'years').subtract(1, 'days');

    const displayValue = dateOffset
      ? getDatesAsString(
          false,
          dateOffset.unit,
          startDate,
          endDate,
          undefined,
          undefined,
          dateRangeDelimiter,
        )
      : startDate.format('YYYY');

    yearOptions.push({
      startDate,
      endDate,
      displayValue,
      value: momentToYear(startDate),
    });
  }

  const menuItems = yearOptions.map(({ displayValue, value }) => (
    <MenuItem value={value} key={displayValue}>
      {displayValue}
    </MenuItem>
  ));

  const selectedOption = yearOptions.find(
    ({ startDate, endDate }) =>
      momentDateValue.clone().isSameOrBefore(endDate) &&
      momentDateValue.clone().isSameOrAfter(startDate),
  );

  return (
    <DatePicker
      label="Year"
      selectedValue={selectedOption?.value}
      onChange={e => onChange(momentToYear(momentDateValue.clone(), e.target.value))}
      menuItems={menuItems}
    />
  );
};
