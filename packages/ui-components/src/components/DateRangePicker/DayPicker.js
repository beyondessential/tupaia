/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { MenuItem } from '../Inputs';
import { DatePicker } from './DatePicker';

export const DayPicker = ({ momentDateValue, minMomentDate, maxMomentDate, onChange }) => {
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

DayPicker.propTypes = {
  momentDateValue: PropTypes.instanceOf(moment).isRequired,
  minMomentDate: PropTypes.instanceOf(moment).isRequired,
  maxMomentDate: PropTypes.instanceOf(moment).isRequired,
  onChange: PropTypes.func.isRequired,
};
