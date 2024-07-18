/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import moment, { Moment } from 'moment';
import { GRANULARITIES_WITH_ONE_DATE, roundStartDate } from '@tupaia/utils';
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
  valueKey,
}: YearPickerProps) => {
  const isSetRangeGranularity = GRANULARITIES_WITH_ONE_DATE.includes(granularity);

  const momentToYear = (momentInstance: Moment, ...args: any[]) =>
    isIsoYear ? momentInstance.isoWeekYear(...(args as [])) : momentInstance.year(...(args as []));

  const getDisplayValue = (dates: { startDate: Moment; endDate: Moment }) => {
    // if no dateOffset, just display the year as usual
    if (!dateOffset) {
      return momentToYear(dates.endDate);
    }

    // Otherwise, use the valueKey to determine which date to display, then display as the unit + year, e.g Jul 2021
    // because in this case, it means the user will be selecting a range of years that each start from a particular offset

    const currentDateMoment = dates[valueKey];

    // when it's a single date, we give the startDate and endDate so that a range is displayed.
    // otherwise we give the currentDateMoment so that only one date is displayed. This is slightly backwards to what you would expect,but when there is a dateOffset set, since we can't display just the year name, we need to display a range when selecting 1 year at a time, and just the unit + year when selecting a range
    const startDateToUse = isSetRangeGranularity ? dates.startDate : currentDateMoment;

    return getDatesAsString(
      isSetRangeGranularity,
      dateOffset.unit,
      startDateToUse,
      currentDateMoment,
      undefined,
      dateOffset,
      dateRangeDelimiter,
    );
  };

  const yearOptions = [];

  const offsetMinDate = roundStartDate(granularity, minMomentDate, dateOffset);

  const yearsToDisplay = Math.ceil(maxMomentDate.clone().diff(offsetMinDate, 'years', true));

  for (let y = 0; y < yearsToDisplay; y++) {
    const startDate = offsetMinDate.clone().add(y, 'years');
    const endDate = startDate.clone().add(1, 'years').subtract(1, 'days');
    const dates = {
      startDate,
      endDate,
    };

    const displayValue = getDisplayValue({ startDate, endDate });

    yearOptions.push({
      ...dates,
      displayValue,
      value: startDate.toISOString(),
    });
  }

  const menuItems = yearOptions.map(({ displayValue, value }) => (
    <MenuItem value={value} key={displayValue}>
      {displayValue}
    </MenuItem>
  ));

  const selectedOption = yearOptions.find(({ startDate, endDate }) => {
    return (
      momentDateValue.clone().isSameOrBefore(endDate) &&
      momentDateValue.clone().isSameOrAfter(startDate)
    );
  });

  const getLabel = () => {
    if (!dateOffset || isSetRangeGranularity) return 'Year';
    if (valueKey === 'startDate') return 'Year starting';
    return 'Year ending';
  };

  const label = getLabel();

  const onChangeValue = (value: number) => {
    const newValue = moment(value);
    onChange(newValue);
  };

  return (
    <DatePicker
      label={label}
      selectedValue={selectedOption?.value}
      onChange={e => onChangeValue(e.target.value)}
      menuItems={menuItems}
    />
  );
};
