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

export const MonthPicker = ({ momentDateValue, minMomentDate, maxMomentDate, onChange }) => {
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

MonthPicker.propTypes = {
  momentDateValue: PropTypes.instanceOf(moment).isRequired,
  minMomentDate: PropTypes.instanceOf(moment).isRequired,
  maxMomentDate: PropTypes.instanceOf(moment).isRequired,
  onChange: PropTypes.func.isRequired,
};
