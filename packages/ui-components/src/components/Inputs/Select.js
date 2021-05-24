/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import MuiMenuItem from '@material-ui/core/MenuItem';
import { KeyboardArrowDown as MuiKeyboardArrowDown } from '@material-ui/icons';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from './TextField';

const KeyboardArrowDown = styled(MuiKeyboardArrowDown)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 24px;
  top: calc(50% - 12px);
  right: 0.9rem;
`;

const StyledTextField = styled(TextField)`
  .MuiSelect-root {
    padding-right: 1.8rem;
    color: ${props => props.theme.palette.text.primary};

    &:focus {
      background: white;
    }
  }
`;

export const SelectField = ({ SelectProps, ...props }) => (
  <StyledTextField
    SelectProps={{
      IconComponent: iconProps => <KeyboardArrowDown {...iconProps} />,
      ...SelectProps,
    }}
    {...props}
    select
  />
);

SelectField.propTypes = {
  SelectProps: PropTypes.object,
};

SelectField.defaultProps = {
  SelectProps: null,
};

export const MenuItem = styled(MuiMenuItem)`
  padding-top: 0.75rem;
  padding-bottom: 0.5rem;
`;

export const Select = ({
  value,
  onChange,
  options,
  showPlaceholder,
  placeholder,
  defaultValue,
  ...props
}) => {
  const [localValue, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    event => {
      setValue(event.target.value);
    },
    [setValue],
  );

  const isControlled = onChange !== null;

  return (
    <SelectField
      value={isControlled ? value : localValue}
      onChange={isControlled ? onChange : handleChange}
      SelectProps={{
        displayEmpty: true,
      }}
      {...props}
    >
      {showPlaceholder && (
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
      )}

      {options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </SelectField>
  );
};

Select.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  showPlaceholder: PropTypes.bool,
  defaultValue: PropTypes.any,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

Select.defaultProps = {
  placeholder: 'Please select',
  showPlaceholder: true,
  defaultValue: '',
  value: '',
  label: null,
  onChange: null,
};

export const NativeSelect = ({ value, onChange, options, placeholder, defaultValue, ...props }) => {
  const [localValue, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    event => {
      setValue(event.target.value);
    },
    [setValue],
  );

  const isControlled = value !== null;

  return (
    <SelectField
      value={isControlled ? value : localValue}
      onChange={isControlled ? onChange : handleChange}
      SelectProps={{
        native: true,
      }}
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectField>
  );
};

NativeSelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.any,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

NativeSelect.defaultProps = {
  placeholder: 'Please select',
  defaultValue: '',
  value: null,
  onChange: null,
};
