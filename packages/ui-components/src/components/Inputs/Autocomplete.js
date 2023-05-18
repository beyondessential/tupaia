/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiAutocomplete from '@material-ui/lab/Autocomplete';
import MuiPaper from '@material-ui/core/Paper';
import MuiKeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CircularProgress from '@material-ui/core/CircularProgress';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TextField } from './TextField';

const KeyboardArrowDown = styled(MuiKeyboardArrowDown)`
  color: ${props => props.theme.palette.text.tertiary};
  font-size: 1.5rem;
`;

const Paper = props => <MuiPaper {...props} variant="outlined" elevation={0} />;

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

export const Autocomplete = ({
  options,
  id,
  label,
  getOptionSelected,
  getOptionLabel,
  value,
  onChange,
  loading,
  placeholder,
  error,
  disabled,
  required,
  helperText,
  onInputChange,
  inputValue,
  muiProps,
  className,
  inputRef,
  name,
  defaultValue,
}) => (
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
        {...params}
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

Autocomplete.propTypes = {
  options: PropTypes.array.isRequired,
  label: PropTypes.string,
  id: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  helperText: PropTypes.string,
  value: PropTypes.any,
  inputValue: PropTypes.any,
  onChange: PropTypes.func,
  getOptionSelected: PropTypes.func,
  getOptionLabel: PropTypes.func,
  placeholder: PropTypes.string,
  onInputChange: PropTypes.func,
  muiProps: PropTypes.object,
  className: PropTypes.string,
  inputRef: PropTypes.func,
  name: PropTypes.string,
  defaultValue: PropTypes.any,
};

Autocomplete.defaultProps = {
  label: '',
  placeholder: '',
  required: false,
  loading: false,
  error: false,
  id: undefined,
  disabled: false,
  getOptionSelected: undefined,
  getOptionLabel: undefined,
  helperText: undefined,
  value: undefined,
  inputValue: undefined,
  onChange: undefined,
  onInputChange: undefined,
  muiProps: undefined,
  className: null,
  inputRef: null,
  name: null,
  defaultValue: null,
};
