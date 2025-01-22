import React from 'react';
import moment from 'moment';
import { MenuItem } from '../Inputs';
import { DatePicker } from './DatePicker';
import { BaseDatePickerProps } from '../../types';

const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export const QuarterPicker = ({
  momentDateValue,
  minMomentDate,
  maxMomentDate,
  onChange,
}: BaseDatePickerProps) => {
  const minAvailableQuarterNumber = momentDateValue.isSame(minMomentDate, 'year')
    ? minMomentDate.quarter()
    : 1;
  const maxAvailableQuarterNumber = momentDateValue.isSame(maxMomentDate, 'year')
    ? maxMomentDate.quarter()
    : 4;

  const menuItems = quarters.map((quarterName, quarterIndex) => {
    const quarterNumber = quarterIndex + 1; // Quarters are 1 indexed
    return (
      <MenuItem
        key={quarterName}
        value={quarterNumber}
        disabled={
          quarterNumber < minAvailableQuarterNumber || quarterNumber > maxAvailableQuarterNumber
        }
      >
        {quarterName}
      </MenuItem>
    );
  });

  return (
    <DatePicker
      label="Quarter"
      selectedValue={momentDateValue.quarter()}
      menuItems={menuItems}
      onChange={e => onChange(moment(momentDateValue).quarter(e.target.value))}
    />
  );
};
