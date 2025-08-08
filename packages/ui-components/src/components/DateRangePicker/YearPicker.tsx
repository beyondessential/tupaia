import React from 'react';
import moment, { Moment } from 'moment';
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
  granularity: YearPickerProps['granularity'],
  dateOffset: YearPickerProps['dateOffset'],
) => {
  const startDate = moment().set({
    year,
    month: 0,
    date: 1,
    hour: 0,
    minute: 0,
    second: 0,
  });

  return roundStartDate(granularity, startDate, dateOffset);
};

const getOffsetEndDateForYear = (
  year: number,
  offsetStartDate: Moment,
  granularity: YearPickerProps['granularity'],
  dateOffset: YearPickerProps['dateOffset'],
) => {
  const isSetRangeGranularity = GRANULARITIES_WITH_ONE_DATE.includes(granularity);

  const endDate = moment().set({
    year,
    month: 11,
    date: 31,
    hour: 23,
    minute: 59,
    second: 59,
  });

  if (isSetRangeGranularity) {
    const { momentUnit } = GRANULARITY_CONFIG[granularity as keyof typeof GRANULARITY_CONFIG];
    return offsetStartDate
      .clone()
      .add(1, momentUnit as any)
      .subtract(1, 'minute'); // set to the end of the day at the end of the range
  }

  return roundEndDate(granularity, endDate, dateOffset);
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

    const offsetStartDate = getOffsetStartDateForYear(year, granularity, dateOffset);

    const offsetEndDate = getOffsetEndDateForYear(year, offsetStartDate, granularity, dateOffset);

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
    const startDate = getOffsetStartDateForYear(y, granularity, dateOffset);
    const endDate = getOffsetEndDateForYear(y, startDate, granularity, dateOffset);
    // use the correct year based on the valueKey
    let yearToUse = y;

    if (dateOffset) {
      const keyDate = valueKey === 'startDate' ? startDate : endDate;
      yearToUse = keyDate.year();
    }

    if (startDate.isAfter(maxMomentDate)) {
      continue;
    }
    yearOptions.push({
      value: yearToUse,
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

  const onChangeValue = (value: number) => {
    return onChange(momentToYear(momentDateValue.clone(), value));
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
      onChange={e => onChangeValue(e.target.value)}
      menuItems={menuItems}
    />
  );
};
