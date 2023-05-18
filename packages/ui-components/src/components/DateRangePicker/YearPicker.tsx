/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Moment } from 'moment';
import { MenuItem } from '../Inputs';
import { DatePicker } from './DatePicker';
import { YearPickerProps } from '../../types/date-picker-types';

export const YearPicker = ({
  momentDateValue,
  minMomentDate,
  maxMomentDate,
  isIsoYear = false,
  onChange,
}: YearPickerProps) => {
  const momentToYear = (momentInstance: Moment, ...args: any[]) =>
    isIsoYear ? momentInstance.isoWeekYear(...(args as [])) : momentInstance.year(...(args as []));

  const minYear = momentToYear(minMomentDate);
  const maxYear = momentToYear(maxMomentDate);
  const yearOptions = [];

  for (let y = minYear; y <= maxYear; y++) {
    yearOptions.push(
      <MenuItem value={y} key={y}>
        {y}
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
