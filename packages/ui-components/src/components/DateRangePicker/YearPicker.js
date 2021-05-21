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

export const YearPicker = ({
  momentDateValue,
  minMomentDate,
  maxMomentDate,
  isIsoYear,
  onChange,
}) => {
  const momentToYear = (momentInstance, ...args) =>
    isIsoYear ? momentInstance.isoWeekYear(...args) : momentInstance.year(...args);
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

YearPicker.propTypes = {
  momentDateValue: PropTypes.instanceOf(moment).isRequired,
  minMomentDate: PropTypes.instanceOf(moment).isRequired,
  maxMomentDate: PropTypes.instanceOf(moment).isRequired,
  isIsoYear: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

YearPicker.defaultProps = {
  isIsoYear: false,
};
