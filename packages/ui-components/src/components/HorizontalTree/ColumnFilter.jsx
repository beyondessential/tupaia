import React, { useCallback, useState } from 'react';
import { TextField } from '../Inputs';
import PropTypes from 'prop-types';
import styled from 'styled-components';

export const ColumnFilterContainer = styled.div`
  height: 91px;
  padding: 20px 10px;
  background-color: ${({ theme }) => theme.palette.grey['200']};
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey['400']};

  .MuiFormControl-root {
    margin: auto;
  }
`;

export const useFilter = () => {
  const [filter, setFilter] = useState('');

  const applyFilter = useCallback(
    (items, { field }) =>
      filter ? items?.filter(item => item[field].toLowerCase().includes(filter)) : items,
    [filter],
  );

  const updateFilter = useCallback(newFilter => {
    setFilter(newFilter.toLowerCase());
  }, []);

  const checkMatchesFilter = useCallback(value => value.toLowerCase().includes(filter), [filter]);

  return { updateFilter, applyFilter, checkMatchesFilter };
};

export const ColumnFilter = ({ disabled, onChange }) => (
  <ColumnFilterContainer>
    <TextField
      disabled={disabled}
      type="text"
      placeholder="Type to filter"
      onChange={event => onChange(event.target.value)}
    />
  </ColumnFilterContainer>
);

ColumnFilter.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

ColumnFilter.defaultProps = {
  disabled: false,
};
