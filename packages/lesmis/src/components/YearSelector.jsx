import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Select } from '@tupaia/ui-components';
import { MIN_DATA_YEAR } from '../constants';

const getYearOptions = () => {
  const years = [];

  const startYear = parseInt(MIN_DATA_YEAR);
  let year = new Date().getFullYear();

  while (year >= startYear) {
    years.push({
      label: year.toString(),
      value: year.toString(),
    });
    year--;
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
      showPlaceholder={false}
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
