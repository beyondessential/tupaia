/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Search } from '@material-ui/icons';
import { TextField } from '@tupaia/ui-components';
import styled from 'styled-components';

const FilterInput = styled(TextField)`
  margin-block-end: 0;
  font-size: inherit;
  width: 100%;
  min-width: 6rem;
  .MuiInputBase-input,
  .MuiOutlinedInput-root {
    font-size: inherit;
  }
  .MuiSvgIcon-root {
    font-size: 1.25rem;
  }
  .MuiInputBase-input {
    padding-block: 0.6rem;
  }
`;

export const FilterCell = ({ column, filters, onFilteredChange }) => {
  const { id, Filter } = column;
  const existingFilter = filters?.find(f => f.id === id);
  const handleUpdate = value => {
    const updatedFilters = existingFilter
      ? filters.map(f => (f.id === id ? { ...f, value } : f))
      : [...filters, { id, value }];

    onFilteredChange(updatedFilters);
  };
  if (Filter) return <Filter column={column} filter={existingFilter} onChange={handleUpdate} />;
  return (
    <FilterInput
      value={existingFilter?.value || ''}
      onChange={e => handleUpdate(e.target.value)}
      placeholder="Search..."
      aria-label={`Search ${column.Header}`}
      InputProps={{
        startAdornment: <Search />,
      }}
    />
  );
};

FilterCell.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onFilteredChange: PropTypes.func.isRequired,
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    Header: PropTypes.string.isRequired,
    Filter: PropTypes.func,
  }).isRequired,
};
