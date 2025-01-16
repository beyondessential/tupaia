import React from 'react';
import moment from 'moment';
import { MenuItem } from '../Inputs';
import { DatePicker } from './DatePicker';
import { BaseDatePickerProps } from '../../types';

export const MonthPicker = ({
  momentDateValue,
  minMomentDate,
  maxMomentDate,
  onChange,
}: BaseDatePickerProps) => {
  const minAvailableMonthIndex = momentDateValue.isSame(minMomentDate, 'year')
    ? minMomentDate.month()
    : 0;
  const maxAvailableMonthIndex = momentDateValue.isSame(maxMomentDate, 'year')
    ? maxMomentDate.month()
    : 11;

  const menuItems = moment.months().map((monthName, monthIndex) => (
    <MenuItem
      key={monthName}
      value={monthIndex}
      disabled={monthIndex < minAvailableMonthIndex || monthIndex > maxAvailableMonthIndex}
    >
      {monthName}
    </MenuItem>
  ));

  return (
    <DatePicker
      label="Month"
      selectedValue={momentDateValue.month()}
      menuItems={menuItems}
      onChange={e => onChange(moment(momentDateValue).month(e.target.value))}
    />
  );
};
