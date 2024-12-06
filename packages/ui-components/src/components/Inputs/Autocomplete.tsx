/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiAutocomplete from '@material-ui/lab/Autocomplete';
import { TextFieldProps } from '@material-ui/core';
import MuiPaper, { PaperProps } from '@material-ui/core/Paper';
import MuiKeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CircularProgress from '@material-ui/core/CircularProgress';
import Popper from '@material-ui/core/Popper';
import styled from 'styled-components';
import { TextField } from './TextField';

const KeyboardArrowDown = styled(MuiKeyboardArrowDown)`
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
    padding: 0.85rem 0.3rem 0.85rem 1.1rem;
  }

  .MuiAutocomplete-inputRoot .MuiAutocomplete-endAdornment {
    right: 0.9rem;
  }
  .MuiInputBase-root.Mui-error {
    background-color: transparent;
    border-color: ${props => props.theme.palette.error.main};
    &.Mui-focused {
      border-color: ${props => props.theme.palette.error.main};
    }
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
  onChange?: (event: Event, newValue: any) => void;
  getOptionSelected?: (option: any, value: any) => boolean;
  getOptionLabel?: (option: any) => string;
  renderOption?: (option: any) => JSX.Element;
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
  tooltip?: string;
  textFieldProps?: TextFieldProps;
}

export const Autocomplete = ({
  options,
  id,
  label = '',
  getOptionSelected,
  getOptionLabel,
  renderOption,
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
  tooltip,
  textFieldProps,
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
    renderOption={renderOption}
    popupIcon={<KeyboardArrowDown />}
    PaperComponent={StyledPaper}
    blurOnSelect
    renderInput={params => (
      <TextField
        {...(params as any)}
        {...textFieldProps}
        label={label}
        tooltip={tooltip}
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
