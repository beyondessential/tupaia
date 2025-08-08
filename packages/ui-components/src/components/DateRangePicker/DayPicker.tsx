import React from 'react';
import { MenuItem } from '../Inputs';
import { DatePicker } from './DatePicker';
import { BaseDatePickerProps } from '../../types';

export const DayPicker = ({
  momentDateValue,
  minMomentDate,
  maxMomentDate,
  onChange,
}: BaseDatePickerProps) => {
  const daysInMonth = momentDateValue.daysInMonth();
  const minAvailableDay = momentDateValue.isSame(minMomentDate, 'month') ? minMomentDate.date() : 1;
  const maxAvailableDay = momentDateValue.isSame(maxMomentDate, 'month')
    ? maxMomentDate.date()
    : daysInMonth;

  const dayOptions = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dayOptions.push(
      <MenuItem value={d} key={d} disabled={d < minAvailableDay || d > maxAvailableDay}>
        {d}
      </MenuItem>,
    );
  }

  return (
    <DatePicker
      label="Day"
      selectedValue={momentDateValue.date()}
      onChange={e => onChange(momentDateValue.clone().date(e.target.value))}
      menuItems={dayOptions}
    />
  );
};
