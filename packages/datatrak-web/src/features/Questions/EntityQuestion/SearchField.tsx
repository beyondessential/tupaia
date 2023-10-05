/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TextField } from '@tupaia/ui-components';
import styled from 'styled-components';
import { Search, Clear } from '@material-ui/icons';
import { InputAdornment, IconButton, TextFieldProps } from '@material-ui/core';

const StyledField = styled(TextField)<TextFieldProps>`
  margin-bottom: 0;

  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
  }

  .MuiInputBase-root.Mui-error {
    background: initial;
  }

  .MuiInputBase-input {
    font-size: 0.875rem;
    padding: 0.6rem 0.2rem;
  }

  .MuiSvgIcon-root {
    margin-left: 0.3rem;
    font-size: 1.2em;
  }

  &&&& {
    .MuiInputBase-input::placeholder {
      color: ${({ theme }) => theme.palette.text.tertiary};
    }
  }
`;

const ClearButton = styled(IconButton)`
  margin-right: -0.6rem;
  padding: 0.5rem;
  font-size: 0.9rem;
`;

export const SearchField = ({
  ref,
  name,
  label,
  id,
  searchValue,
  onChangeSearch,
  isDirty,
  invalid,
}) => {
  const displayValue = isDirty ? searchValue : '';

  const handleClear = () => {
    onChangeSearch('');
  };

  const handleChange = event => {
    onChangeSearch(event.target.value);
  };

  return (
    <StyledField
      id={id}
      label={label}
      name={name}
      ref={ref}
      onChange={handleChange}
      value={displayValue}
      error={invalid}
      placeholder="Search..."
      // disable browser autofill
      autoComplete="one-time-code"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
        endAdornment:
          isDirty && searchValue ? (
            <InputAdornment position="end">
              <ClearButton onMouseDown={handleClear}>
                <Clear />
              </ClearButton>
            </InputAdornment>
          ) : null,
      }}
    />
  );
};
