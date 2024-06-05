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
import { useSearchParams } from 'react-router-dom';

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
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const urlFilters = urlSearchParams.get('filters');
  const filters = urlFilters ? JSON.parse(urlFilters) : [];
  const existingFilter = filters.find(f => f.id === id);
  const [filterValue, setFilterValue] = useState(existingFilter?.value);

  const debouncedFilterValue = useDebounce(filterValue, 300);

  const handleUpdate = value => {
    let updatedFilters = [];
    if (value === '' || value === undefined) {
      updatedFilters = filters.filter(f => f.id !== id);
    } else {
      updatedFilters = existingFilter
        ? filters.map(f => (f.id === id ? { ...f, value } : f))
        : [...filters, { id, value }];
    }

    if (updatedFilters.length === 0) {
      urlSearchParams.delete('filters');
      setUrlSearchParams(urlSearchParams);
      return;
    }

    setUrlSearchParams({ filters: JSON.stringify(updatedFilters) });
  };

  useEffect(() => {
    handleUpdate(debouncedFilterValue);
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
