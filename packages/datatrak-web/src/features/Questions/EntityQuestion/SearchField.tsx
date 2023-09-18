/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TextField } from '@tupaia/ui-components';
import styled from 'styled-components';
import SearchIcon from '@material-ui/icons/Search';
import { InputAdornment } from '@material-ui/core';

const StyledField = styled(TextField)`
  margin-bottom: 0.9rem;

  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
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

export const SearchField = ({ ref, name, label, id, searchValue, onChangeSearch, isDirty }) => {
  const displayValue = isDirty ? searchValue : '';

  return (
    <StyledField
      id={id}
      label={label}
      name={name!}
      ref={ref}
      onChange={onChangeSearch}
      value={displayValue}
      placeholder="Search..."
      autoComplete="one-time-code"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};
