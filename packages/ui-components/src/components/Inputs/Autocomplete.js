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
  color: ${props => props.theme.palette.grey['500']};
  font-size: 1.75rem;
`;

const Paper = props => <MuiPaper {...props} variant="outlined" elevation={0} />;

const StyledPaper = styled(Paper)`
  .MuiAutocomplete-option {
    padding: 0.6rem 1.2rem;
  }
`;

const StyledAutocomplete = styled(MuiAutocomplete)`
  .MuiAutocomplete-endAdornment {
    padding-right: 0.5rem;
  }
`;

/**
 * Autocomplete
 */
export const Autocomplete = ({
  options,
  id,
  label,
  labelKey,
  value,
  onChange,
  loading,
  placeholder,
  error,
  disabled,
  required,
  helperText,
  onInputChange,
  muiProps,
}) => (
  <StyledAutocomplete
    id={id}
    options={options}
    value={value}
    disabled={disabled}
    onChange={onChange}
    loading={loading}
    onInputChange={onInputChange}
    getOptionSelected={(option, selected) => option[labelKey] === selected[labelKey]}
    getOptionLabel={option => (option ? option[labelKey] : '')}
    popupIcon={<KeyboardArrowDown />}
    PaperComponent={StyledPaper}
    renderInput={params => (
      <TextField
        {...params}
        label={label}
        placeholder={placeholder}
        error={error}
        required={required}
        helperText={helperText}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <React.Fragment>
              {loading ? <CircularProgress color="inherit" size={20} /> : null}
              {params.InputProps.endAdornment}
            </React.Fragment>
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
  onChange: PropTypes.func,
  labelKey: PropTypes.string,
  placeholder: PropTypes.string,
  onInputChange: PropTypes.func,
  muiProps: PropTypes.object,
};

Autocomplete.defaultProps = {
  label: '',
  labelKey: 'name',
  placeholder: '',
  required: false,
  loading: false,
  error: false,
  id: undefined,
  disabled: false,
  helperText: undefined,
  value: undefined,
  onChange: undefined,
  onInputChange: undefined,
  muiProps: undefined,
};
