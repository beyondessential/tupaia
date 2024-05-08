/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DefaultFilter } from '../columnTypes/columnFilters';
import { HeaderDisplayCell } from './Cells';

const FilterWrapper = styled.div`
  .MuiFormControl-root {
    margin-block-end: 0;
  }
  .MuiInputBase-input,
  .MuiOutlinedInput-root {
    font-size: inherit;
  }
  .MuiSvgIcon-root {
    font-size: 1.25rem;
  }
  .MuiInputBase-input {
    padding-block: 0.6rem;
    padding-inline: 0.6rem;
    line-height: 1.2;
  }
  .MuiAutocomplete-popperDisablePortal,
  .MuiPaper-root,
  .MuiAutocomplete-option,
  .MuiAutocomplete-popperDisablePortal,
  .MuiPaper-root,
  .MuiAutocomplete-option {
    font-size: inherit;
  }
  .MuiAutocomplete-listbox {
    padding-block: 0.3rem;
  }
  .MuiAutocomplete-option {
    padding-block: 0.5rem;
  }
`;

export const FilterCell = ({ column, filters, onFilteredChange, width, isButtonColumn }) => {
  const { id, Filter } = column;
  const existingFilter = filters?.find(f => f.id === id);
  const handleUpdate = value => {
    const updatedFilters = existingFilter
      ? filters.map(f => (f.id === id ? { ...f, value } : f))
      : [...filters, { id, value }];

    onFilteredChange(updatedFilters);
  };
  if (!column.filterable) return <HeaderDisplayCell isButtonColumn={isButtonColumn} />;
  return (
    <HeaderDisplayCell width={width}>
      <FilterWrapper>
        {Filter ? (
          <Filter column={column} filter={existingFilter} onChange={handleUpdate} />
        ) : (
          <DefaultFilter
            value={existingFilter?.value || ''}
            onChange={e => handleUpdate(e.target.value)}
            aria-label={`Search ${column.Header}`}
          />
        )}
      </FilterWrapper>
    </HeaderDisplayCell>
  );
};

FilterCell.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onFilteredChange: PropTypes.func.isRequired,
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    Header: PropTypes.string.isRequired,
    Filter: PropTypes.func,
    filterable: PropTypes.bool,
  }).isRequired,
  width: PropTypes.number,
  isButtonColumn: PropTypes.bool,
};

FilterCell.defaultProps = {
  width: null,
  isButtonColumn: false,
};
