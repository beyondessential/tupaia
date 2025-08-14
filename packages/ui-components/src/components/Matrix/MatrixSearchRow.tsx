import React, { useContext, useEffect, useState } from 'react';
import { IconButton, TableRow } from '@material-ui/core';
import { Clear, Search as SearchIcon } from '@material-ui/icons';
import styled from 'styled-components';
import { TextField } from '../Inputs';
import { MatrixContext, SearchFilter } from './MatrixContext';
import { HeaderCell } from './Cell';
import { getFlattenedColumns } from './utils';

const SearchInput = styled(TextField)`
  margin: 0;
  width: 11rem; // apply a min-width to prevent the input from shrinking too much if the column content is too narrow
  .MuiInputBase-root {
    background-color: transparent;
    font-size: 0.7rem; // override this to inherit the font size from the cell
  }
  .MuiSvgIcon-root {
    font-size: 1rem;
    color: ${({ theme }) => theme.palette.divider};
  }
  .MuiIconButton-root {
    padding: 0.2rem;
    .MuiSvgIcon-root {
      color: ${({ theme }) => theme.palette.text.primary};
    }
  }
  .MuiInputBase-input {
    padding-block: 0.7rem;
    padding-inline: 0.2rem;
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
  }
  .MuiInputBase-input::placeholder {
    color: ${({ theme }) => theme.palette.divider};
  }
`;

interface SearchProps {
  value: string;
  onChange: (filter: SearchFilter) => void;
  onClear: (key: SearchFilter['key']) => void;
  columnKey: SearchFilter['key'];
}

const Search = ({ value, onChange, onClear, columnKey }: SearchProps) => {
  const [searchValue, setSearchValue] = useState(value);
  const clearSearchFilter = () => {
    setSearchValue('');
  };

  const changeSearchFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  // debounce the search filter
  useEffect(() => {
    if (searchValue === value) return;
    const timeout = setTimeout(() => {
      if (!searchValue) {
        onClear(columnKey);
      } else
        onChange({
          key: columnKey,
          value: searchValue,
        });
    }, 100);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    if (value === searchValue) return;
    setSearchValue(value);
  }, [value]);

  return (
    <SearchInput
      placeholder="Search..."
      value={searchValue}
      onChange={changeSearchFilter}
      InputProps={{
        startAdornment: <SearchIcon />,
        endAdornment: value && (
          <IconButton onClick={clearSearchFilter}>
            <Clear />
          </IconButton>
        ),
      }}
    />
  );
};

/**
 * This is a component that renders the header rows in the matrix. It renders the column groups and columns.
 */
export const MatrixSearchRow = ({
  onPageChange,
}: {
  onPageChange: (newPageIndex: number) => void;
}) => {
  const { columns, enableSearch, searchFilters, updateSearchFilter, clearSearchFilter } =
    useContext(MatrixContext);

  if (!enableSearch) return null;

  const flattenedColumns = getFlattenedColumns(columns);

  const columnsToFilter = [{ key: 'dataElement' }, ...flattenedColumns];

  const onClear = (key: SearchFilter['key']) => {
    if (!clearSearchFilter) return;
    clearSearchFilter(key);
    onPageChange(0);
  };

  const onUpdate = (newFilter: SearchFilter) => {
    if (!updateSearchFilter) return;
    updateSearchFilter(newFilter);
    onPageChange(0);
  };

  return (
    <TableRow>
      {columnsToFilter.map(({ key }, i) => (
        <HeaderCell key={key} className={i === 0 ? 'MuiTableCell-row-head' : ''}>
          <Search
            value={searchFilters?.find(filter => filter.key === key)?.value ?? ''}
            onChange={onUpdate}
            onClear={onClear}
            columnKey={key}
          />
        </HeaderCell>
      ))}
    </TableRow>
  );
};
