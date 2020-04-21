/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiAutocomplete from '@material-ui/lab/Autocomplete';
import MuiPaper from '@material-ui/core/Paper';
import MuiKeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import * as COLORS from '../../theme/colors';
import { TextField } from './TextField';

const KeyboardArrowDown = styled(MuiKeyboardArrowDown)`
  color: ${COLORS.GREY_9F};
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
  label,
  options,
  labelKey,
  value,
  onChange,
  placeholder,
  ...props
}) => (
  <StyledAutocomplete
    options={options}
    value={value}
    onChange={onChange}
    getOptionSelected={(option, selected) => option[labelKey] === selected[labelKey]}
    getOptionLabel={option => (option ? option[labelKey] : '')}
    popupIcon={<KeyboardArrowDown />}
    PaperComponent={StyledPaper}
    renderInput={params => <TextField {...params} label={label} placeholder={placeholder} />}
    {...props}
  />
);

Autocomplete.propTypes = {
  options: PropTypes.array.isRequired,
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  labelKey: PropTypes.string,
  placeholder: PropTypes.string,
};

Autocomplete.defaultProps = {
  label: '',
  value: undefined,
  onChange: undefined,
  labelKey: 'name',
  placeholder: '',
};
