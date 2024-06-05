/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DefaultFilter } from '../columnTypes/columnFilters';
import { HeaderDisplayCell } from './Cells';
import { useDebounce } from '../../utilities';
import { useColumnFilters } from './useColumnFilters';

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

const useFilter = id => {
  const { onChangeFilter, filters } = useColumnFilters();
  const existingFilter = filters.find(f => f.id === id);
  const [filterValue, setFilterValue] = useState(existingFilter?.value);

  const debouncedFilterValue = useDebounce(filterValue, 300);

  useEffect(() => {
    onChangeFilter(id, debouncedFilterValue);
  }, [debouncedFilterValue]);

  return {
    filterValue,
    setFilterValue,
  };
};

export const FilterCell = ({ column, ...props }) => {
  const { id, Filter } = column;
  const { filterValue, setFilterValue } = useFilter(id);

  if (!column.filterable) return <HeaderDisplayCell {...props} />;

  return (
    <HeaderDisplayCell {...props}>
      <FilterWrapper>
        {Filter ? (
          <Filter column={column} onChange={setFilterValue} value={filterValue} />
        ) : (
          <DefaultFilter
            value={filterValue ?? ''}
            onChange={e => setFilterValue(e.target.value)}
            aria-label={`Search ${column.Header}`}
          />
        )}
      </FilterWrapper>
    </HeaderDisplayCell>
  );
};

FilterCell.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    Header: PropTypes.string.isRequired,
    Filter: PropTypes.func,
    filterable: PropTypes.bool,
  }).isRequired,
};
