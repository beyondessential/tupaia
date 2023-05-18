/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiAutocomplete from '@material-ui/lab/Autocomplete';
import MuiPaper, { PaperProps } from '@material-ui/core/Paper';
import MuiKeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CircularProgress from '@material-ui/core/CircularProgress';
import styled from 'styled-components';
import { TextField } from './TextField';

const KeyboardArrowDown = styled(MuiKeyboardArrowDown)`
  color: ${props => props.theme.palette.text.tertiary};
  font-size: 1.5rem;
`;

const Paper = (props: PaperProps) => <MuiPaper {...props} variant="outlined" elevation={0} />;

const StyledPaper = styled(Paper)`
  .MuiAutocomplete-option {
    padding: 0.6rem 1.2rem;
  }
`;

const StyledAutocomplete = styled(MuiAutocomplete)`
  .MuiAutocomplete-inputRoot.MuiInputBase-adornedEnd.MuiOutlinedInput-adornedEnd {
    padding: 0 2.8rem 0 0;
  }

  .MuiInputBase-input.MuiAutocomplete-input.MuiInputBase-inputAdornedEnd {
    padding: 0.9rem 0.3rem 1rem 0.9rem;
  }

  .MuiAutocomplete-inputRoot .MuiAutocomplete-endAdornment {
    right: 0.9rem;
  }
`;

export interface BaseAutocompleteProps {
  label?: string;
  value?: any;
  id?: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  helperText?: string;
  onChange?: (event: Event, newValue: string) => void;
  getOptionSelected?: (option: any, value: any) => boolean;
  getOptionLabel?: (option: any) => string;
  placeholder?: string;
  muiProps?: any;
}

interface AutocompleteProps extends BaseAutocompleteProps {
  options: any[];
  loading?: boolean;
  onInputChange?: (event: any, newValue: any) => void;
  inputValue?: any;
  className?: string;
  inputRef?: any;
  name?: string;
  defaultValue?: any;
}

export const Autocomplete = ({
  options,
  id,
  label = '',
  getOptionSelected,
  getOptionLabel,
  value,
  onChange,
  loading = false,
  placeholder = '',
  error = false,
  disabled = false,
  required = false,
  helperText,
  onInputChange,
  inputValue,
  muiProps,
  className,
  inputRef,
  name,
  defaultValue,
}: AutocompleteProps) => (
  <StyledAutocomplete
    id={id}
    className={className}
    options={options}
    value={value}
    disabled={disabled}
    onChange={onChange}
    loading={loading}
    defaultValue={defaultValue}
    disableClearable={loading}
    onInputChange={onInputChange}
    inputValue={inputValue}
    getOptionSelected={getOptionSelected}
    getOptionLabel={getOptionLabel}
    popupIcon={<KeyboardArrowDown />}
    PaperComponent={StyledPaper}
    renderInput={params => (
      <TextField
        {...(params as any)}
        label={label}
        name={name}
        placeholder={placeholder}
        error={error}
        required={required}
        helperText={helperText}
        inputRef={inputRef}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    )}
    {...muiProps}
  />
);
