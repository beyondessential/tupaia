/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Search } from '@material-ui/icons';
import { StandardTextFieldProps } from '@material-ui/core';
import { ColumnInstance } from 'react-table';
import { TextField } from '../Inputs';
import { HeaderDisplayCell, HeaderDisplayCellProps } from './Cells';
import { useDebounce } from '../../hooks';

const FilterWrapper = styled.div`
  .MuiFormControl-root {
    margin-block-end: 0;
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
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
  .MuiInputBase-input::-webkit-input-placeholder {
    color: #b8b8b8;
  }
  .MuiInputBase-adornedStart .MuiSvgIcon-root {
    color: #b8b8b8;
  }
`;

const DefaultFilterInput = styled(TextField)`
  margin-block-end: 0;
  font-size: inherit;
  width: 100%;
  min-width: 6rem;
  max-width: 100%;
  // The following is overriding the padding in ui-components to make sure all filters match styling
  .MuiInputBase-input,
  .MuiInputBase-input.MuiAutocomplete-input.MuiInputBase-inputAdornedEnd {
    padding-block: 0.6rem;
    padding-inline: 0.2rem;
  }
  .MuiInputBase-root,
  .MuiAutocomplete-inputRoot.MuiInputBase-adornedEnd.MuiOutlinedInput-adornedEnd {
    padding-inline-start: 0.3rem;
  }
  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.divider};
  }
`;

interface DefaultFilterProps extends Omit<StandardTextFieldProps, 'onChange' | 'value'> {
  value?: string | null;
  onChange: (value: string) => void;
}

const DefaultFilter = ({ value, onChange, ...props }: DefaultFilterProps) => {
  const [stateValue, setStateValue] = useState<string>(value ?? '');
  const debouncedSearchValue = useDebounce(stateValue, 500);

  useEffect(() => {
    if (debouncedSearchValue === value) return;
    onChange(debouncedSearchValue);
  }, [debouncedSearchValue]);

  useEffect(() => {
    if (value === stateValue) return;
    setStateValue(value ?? '');
  }, [value]);
  return (
    <DefaultFilterInput
      {...props}
      value={stateValue}
      onChange={e => setStateValue(e.target.value)}
      InputProps={{
        startAdornment: <Search />,
      }}
      placeholder="Search..."
    />
  );
};

export type Filters = Record<string, any>[];

export interface FilterCellProps extends Partial<HeaderDisplayCellProps> {
  column: ColumnInstance<Record<string, any>> & {
    Filter?: React.ComponentType<{
      column: ColumnInstance<Record<string, any>>;
      filter?: any;
      onChange: (value: any) => void;
      value: any;
    }>;
    filterable?: boolean;
  };
  filters: Filters;
  onChangeFilters: (filters: Filters) => void;
}

export const FilterCell = ({ column, filters, onChangeFilters, ...props }: FilterCellProps) => {
  const { id, Filter } = column;
  const existingFilter = filters?.find(f => f.id === id);
  const handleUpdate = (value: any) => {
    const updatedFilters = existingFilter
      ? filters.map(f => (f.id === id ? { ...f, value } : f))
      : [...filters, { id, value }];

    onChangeFilters(updatedFilters);
  };
  if (!column.filterable) return <HeaderDisplayCell {...props} maxWidth={column.maxWidth} />;

  return (
    <HeaderDisplayCell {...props} maxWidth={column.maxWidth}>
      <FilterWrapper>
        {Filter ? (
          <Filter
            column={column}
            filter={existingFilter}
            onChange={handleUpdate}
            value={existingFilter?.value}
          />
        ) : (
          <DefaultFilter
            value={existingFilter?.value || ''}
            onChange={handleUpdate}
            aria-label={`Search ${column.Header}`}
          />
        )}
      </FilterWrapper>
    </HeaderDisplayCell>
  );
};
