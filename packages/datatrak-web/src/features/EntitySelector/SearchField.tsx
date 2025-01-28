import React from 'react';
import { TextField } from '@tupaia/ui-components';
import styled from 'styled-components';
import { Search, Clear } from '@material-ui/icons';
import { InputAdornment, IconButton, TextFieldProps } from '@material-ui/core';
import { InputHelperText } from '../../components';

const StyledField = styled(TextField)<TextFieldProps>`
  margin-bottom: 0;
  display: flex;

  .MuiFormLabel-root {
    color: ${({ theme }) => theme.palette.text.primary};
  }
  .MuiFormHelperText-root {
    margin-bottom: 0.6rem;
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
  }

  .MuiInputBase-root.Mui-error {
    background: initial;
  }
  .MuiInputBase-root {
    order: 2;
  }

  .MuiInputBase-input.MuiOutlinedInput-input {
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

type SearchFieldProps = TextFieldProps & {
  searchValue: string;
  onChangeSearch: (value: string) => void;
  isDirty: boolean;
  invalid: boolean;
  detailLabel?: string;
  required?: boolean;
};

export const SearchField = React.forwardRef<HTMLDivElement, SearchFieldProps>((props, ref) => {
  const {
    name,
    label,
    id,
    searchValue,
    onChangeSearch,
    isDirty,
    invalid,
    detailLabel,
    required,
    inputProps,
  } = props;

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
      inputRef={ref}
      required={required}
      onChange={handleChange}
      value={displayValue}
      error={invalid}
      helperText={detailLabel}
      FormHelperTextProps={{
        component: InputHelperText,
      }}
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
      inputProps={inputProps}
    />
  );
});
