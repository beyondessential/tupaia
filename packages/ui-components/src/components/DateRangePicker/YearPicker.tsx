/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import moment, { Moment } from 'moment';
import { MenuItem } from '../Inputs';
import { DatePicker } from './DatePicker';
import { YearPickerProps } from '../../types';
import { getDatesAsString } from './useDateRangePicker';
import { roundEndDate, roundStartDate } from '@tupaia/utils';

export const YearPicker = ({
  momentDateValue,
  minMomentDate,
  maxMomentDate,
  isIsoYear = false,
  onChange,
  dateOffset,
  granularity,
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

    const displayString = dateOffset
      ? getDatesAsString(false, dateOffset.unit, startDate, endDate)
      : startDate.format('YYYY');

    const endDateString = momentToYear(endDate);

    yearOptions.push(
      <MenuItem value={endDateString} key={endDateString}>
        {displayString}
      </MenuItem>,
    );
  }

  return (
    <DatePicker
      label="Year"
      selectedValue={momentToYear(momentDateValue)}
      onChange={e => onChange(momentToYear(momentDateValue.clone(), e.target.value))}
      menuItems={yearOptions}
    />
  );
};
