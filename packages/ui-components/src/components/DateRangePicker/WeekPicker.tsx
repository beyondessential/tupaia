import React from 'react';
import { Moment } from 'moment';
import {
  GRANULARITY_CONFIG,
  GRANULARITIES,
  WEEK_DISPLAY_CONFIG,
  momentToDateDisplayString,
} from '@tupaia/utils';
import { MenuItem } from '../Inputs';
import { DatePicker } from './DatePicker';
import { ModifierType, WeekPickerProps } from '../../types';

const useBoundaryWeekOrDefault = (currentDate: Moment, boundaryDate: Moment, defaultWeek: number) =>
  currentDate.isoWeekYear() === boundaryDate.isoWeekYear() ? boundaryDate.isoWeek() : defaultWeek;

export const WeekPicker = ({
  momentDateValue,
  minMomentDate,
  maxMomentDate,
  weekDisplayFormat,
  onChange,
}: WeekPickerProps) => {
  // need to cast string of modifier to type
  const { pickerFormat, modifier } = (weekDisplayFormat
    ? WEEK_DISPLAY_CONFIG[weekDisplayFormat]
    : GRANULARITY_CONFIG[GRANULARITIES.WEEK]) as {
    pickerFormat: string;
    modifier?: ModifierType;
  };

  const date = momentDateValue.isoWeekday(1);

  const weeksInYear = date.isoWeeksInYear();
  const minAvailableWeekIndex = useBoundaryWeekOrDefault(date, minMomentDate, 1);
  const maxAvailableWeekIndex = useBoundaryWeekOrDefault(date, maxMomentDate, weeksInYear);

  const menuItems = [];
  // Prefer moment mutation to creation for performance reasons
  const mutatingMoment = date.clone();
  for (let w = 1; w <= weeksInYear; w++) {
    const weekLabel = momentToDateDisplayString(
      mutatingMoment.isoWeek(w),
      GRANULARITIES.SINGLE_WEEK,
      pickerFormat,
      modifier,
    );

    const disabled = w < minAvailableWeekIndex || w > maxAvailableWeekIndex;

    menuItems.push(
      <MenuItem value={w} key={w} disabled={disabled}>
        {weekLabel}
      </MenuItem>,
    );
  }

  return (
    <DatePicker
      label="Week"
      selectedValue={date.isoWeek()}
      menuItems={menuItems}
      onChange={e => onChange(date.clone().isoWeek(e.target.value))}
    />
  );
};
