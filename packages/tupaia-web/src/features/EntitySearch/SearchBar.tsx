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
    border-color: transparent;
    &:hover {
      border-color: ${({ theme }) => theme.palette.text.primary};
    }
  }
  .MuiOutlinedInput-notchedOutline {
    // border-color: transparent;
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
    onChange(event.target.value);
  };
  return (
    <SearchInput
      value={value}
      onChange={onChangeInputValue}
      onFocus={() => onFocusChange(true)}
      onBlur={() => onFocusChange(false)}
    />
  );
};
