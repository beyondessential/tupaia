import MenuItem from 'material-ui/MenuItem';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import { DatePicker } from './DatePicker';
import {
  GRANULARITY_CONFIG,
  GRANULARITIES,
  momentToDateString,
} from '../../utils/periodGranularities';
import { WEEK_DISPLAY_CONFIG } from '../../utils/weekDisplayFormats';

const useBoundaryWeekOrDefault = (currentDate, boundaryDate, defaultWeek) =>
  currentDate.isoWeekYear() === boundaryDate.isoWeekYear() ? boundaryDate.isoWeek() : defaultWeek;

export const WeekPicker = props => {
  const { momentDateValue, minMomentDate, maxMomentDate, onChange, weekDisplayFormat } = props;

  const { pickerFormat, modifier } = weekDisplayFormat
    ? WEEK_DISPLAY_CONFIG[weekDisplayFormat]
    : GRANULARITY_CONFIG[GRANULARITIES.WEEK];

  const date = momentDateValue.isoWeekday(1);

  const weeksInYear = date.isoWeeksInYear();
  const minAvailableWeekIndex = useBoundaryWeekOrDefault(date, minMomentDate, 1);
  const maxAvailableWeekIndex = useBoundaryWeekOrDefault(date, maxMomentDate, weeksInYear);

  const menuItems = [];
  const weekLabelsByIsoWeek = {};
  // Prefer moment mutation to creation for performance reasons
  const mutatingMoment = date.clone();
  for (let w = 1; w <= weeksInYear; w++) {
    const weekLabel = momentToDateString(
      mutatingMoment.isoWeek(w),
      GRANULARITIES.SINGLE_WEEK,
      pickerFormat,
      modifier,
    );
    weekLabelsByIsoWeek[w] = weekLabel;

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
      getFormattedValue={w => weekLabelsByIsoWeek[w]}
    />
  );
};

WeekPicker.propTypes = {
  momentDateValue: PropTypes.instanceOf(moment).isRequired,
  minMomentDate: PropTypes.instanceOf(moment).isRequired,
  maxMomentDate: PropTypes.instanceOf(moment).isRequired,
  onChange: PropTypes.func.isRequired,
};
