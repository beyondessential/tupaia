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
  const yearOptions = [];

  const getDisplayLabel = (year: number) => {
    // if there is no dateOffset, return the year as it is
    if (!dateOffset) return year;

    const offsetStartDate = roundStartDate(
      granularity,
      momentToYear(momentDateValue.clone(), year),
      dateOffset,
    );

    const { momentUnit } = GRANULARITY_CONFIG[granularity as keyof typeof GRANULARITY_CONFIG];
    if (isSetRangeGranularity) {
      const offsetEndDate = offsetStartDate.clone().add(1, momentUnit);
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

    const offsetEndDate = roundEndDate(
      granularity,
      momentToYear(momentDateValue.clone(), year),
      dateOffset,
    );

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
    yearOptions.push(
      <MenuItem value={y} key={y}>
        {displayLabel}
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
