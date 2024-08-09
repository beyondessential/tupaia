/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { HeaderDisplayCell, HeaderDisplayCellProps } from './Cells';
import { TextField } from '../Inputs';
import { Search } from '@material-ui/icons';
import { ColumnInstance } from 'react-table';

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

export const DefaultFilter = styled(TextField).attrs(props => ({
  InputProps: {
    ...props.InputProps,
    startAdornment: <Search />,
  },
  placeholder: 'Search...',
}))`
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
    color: ${({ theme }) => theme.palette.text.tertiary};
  }
`;

export type Filters = Record<string, any>[];

export interface FilterCellProps extends Partial<HeaderDisplayCellProps> {
  column: ColumnInstance<Record<string, any>> & {
    Filter?: React.ComponentType<{
      column: ColumnInstance<Record<string, any>>;
      filter?: any;
      onChange: (value: any) => void;
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
