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

const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export const QuarterPicker = ({ momentDateValue, minMomentDate, maxMomentDate, onChange }) => {
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

QuarterPicker.propTypes = {
  momentDateValue: PropTypes.instanceOf(moment).isRequired,
  minMomentDate: PropTypes.instanceOf(moment).isRequired,
  maxMomentDate: PropTypes.instanceOf(moment).isRequired,
  onChange: PropTypes.func.isRequired,
};
