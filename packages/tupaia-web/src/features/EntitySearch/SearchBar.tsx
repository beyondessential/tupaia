/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TextField, TextFieldProps } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import styled from 'styled-components';

const SearchInput = styled(TextField).attrs({
  variant: 'outlined',
  placeholder: 'Search location',
  fullWidth: true,
  InputProps: {
    startAdornment: <SearchIcon />,
  },
})<TextFieldProps>`
  .MuiInputBase-root {
    background: ${({ theme }) => theme.searchBar.background};
    border-radius: 2.7rem;
  }

  .MuiOutlinedInput-notchedOutline {
    border: 2px transparent solid;
  }

  &:hover .MuiOutlinedInput-notchedOutline {
    border: 2px ${({ theme }) => theme.form.border} solid;
  }

  .Mui-focused .MuiOutlinedInput-notchedOutline {
    border: 2px ${({ theme }) => theme.palette.primary.main} solid;
  }

  .MuiInputBase-input {
    padding: 0.6em;
  }
`;

interface SearchBarProps {
  value?: string;
  onChange: (newValue: string) => void;
  onFocusChange: (isFocused: boolean) => void;
}

export const SearchBar = ({ value = '', onChange, onFocusChange }: SearchBarProps) => {
  const onChangeInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('search value...', event.target.value);
    onChange(event.target.value);
  };

  return (
    <SearchInput value={value} onChange={onChangeInputValue} onFocus={() => onFocusChange(true)} />
  );
};
