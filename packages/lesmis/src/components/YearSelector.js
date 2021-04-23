/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Select } from '@tupaia/ui-components';
import { MIN_DATA_YEAR, ALL_DATES_VALUE } from '../constants';

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [
    {
      label: 'All Data',
      value: ALL_DATES_VALUE,
    },
  ];
  let year = MIN_DATA_YEAR;
  while (year <= currentYear) {
    years.push({
      label: year.toString(),
      value: year.toString(),
    });
    year++;
  }
  return years;
};

const yearOptions = getYearOptions();

const StyledSelect = styled(Select)`
  flex: 1;
  margin: 0 1rem 0 0;
  width: 8rem;
`;

export const YearSelector = ({ value, onChange, id, label, className }) => {
  const handleChangeYear = event => {
    onChange(event.target.value);
  };

  return (
    <StyledSelect
      id={id}
      label={label}
      className={className}
      options={yearOptions}
      value={value}
      onChange={handleChangeYear}
    />
  );
};

YearSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
};

YearSelector.defaultProps = {
  id: 'yearSelector',
  className: '',
  label: null,
};
