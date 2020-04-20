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
  color: ${COLORS.GREY_72};
  font-size: 28px;
  top: calc(50% - 14px);
  right: 16px;
`;

const Paper = props => <MuiPaper {...props} variant="outlined" elevation={0} />;

const StyledPaper = styled(Paper)`
  .MuiAutocomplete-option {
    padding: 10px 20px;
  }
`;

/**
 * Autocomplete
 */
export const Autocomplete = ({ options, labelKey, ...props }) => (
  <MuiAutocomplete
    options={options}
    getOptionSelected={(option, value) => option[labelKey] === value[labelKey]}
    getOptionLabel={option => option[labelKey]}
    popupIcon={<KeyboardArrowDown />}
    PaperComponent={StyledPaper}
    renderInput={params => (
      <TextField {...params} label={props.label} placeholder={props.placeholder} />
    )}
    {...props}
  />
);

Autocomplete.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  labelKey: PropTypes.string,
  placeholder: PropTypes.string,
};

Autocomplete.defaultProps = {
  labelKey: 'name',
  placeholder: '',
};
