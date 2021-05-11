/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiFormControl from '@material-ui/core/FormControl';
import MuiInputLabel from '@material-ui/core/InputLabel';
import MuiSelect from '@material-ui/core/Select';
import MuiInput from '@material-ui/core/Input';

const LABEL_COLOR = '#757575';

const FormControl = styled(MuiFormControl)`
  width: 100%;
  margin-right: 0.8rem;

  &:last-child {
    margin-right: 0;
  }
`;

const InputLabel = styled(MuiInputLabel)`
  color: ${LABEL_COLOR};
`;

const Select = styled(MuiSelect)`
  //
`;

const Input = styled(MuiInput)`
  border-bottom: 1px solid ${LABEL_COLOR};
`;

export const DatePicker = ({ label, selectedValue, onChange, menuItems, getFormattedValue }) => (
  <FormControl>
    <InputLabel shrink>{label}</InputLabel>
    <Select
      value={selectedValue}
      onChange={onChange}
      renderValue={value => <span>{getFormattedValue(value)}</span>}
      input={<Input disableUnderline />}
    >
      {menuItems}
    </Select>
  </FormControl>
);

DatePicker.propTypes = {
  label: PropTypes.string.isRequired,
  selectedValue: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  menuItems: PropTypes.array.isRequired,
  getFormattedValue: PropTypes.func,
};

DatePicker.defaultProps = {
  getFormattedValue: value => value,
};
