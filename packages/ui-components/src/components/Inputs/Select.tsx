/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import { KeyboardArrowDown as MuiKeyboardArrowDown } from '@material-ui/icons';
import {
  SelectProps as MuiSelectProps,
  SvgIconProps,
  TextFieldProps,
  MenuItem as MuiMenuItem,
} from '@material-ui/core';
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
type SelectFieldProps = TextFieldProps & {
  SelectProps?: MuiSelectProps;
};

export const SelectField = ({ SelectProps = {}, ...props }: SelectFieldProps) => (
  <StyledTextField
    SelectProps={{
      IconComponent: (iconProps: SvgIconProps) => <KeyboardArrowDown {...iconProps} />,
      ...SelectProps,
    }}
    {...props}
    select
  />
);
export const MenuItem = styled(MuiMenuItem)`
  padding-top: 0.75rem;
  padding-bottom: 0.5rem;
`;

type Option = {
  value: any;
  label: string;
};

type SelectProps = SelectFieldProps & {
  options: Option[];
  showPlaceholder?: boolean;
};

export const Select = ({
  value = '',
  onChange = null,
  options = [],
  showPlaceholder = true,
  placeholder = 'Please select',
  defaultValue = '',
  ...props
}: SelectProps) => {
  const [localValue, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    event => {
      setValue(event.target.value);
    },
    [setValue],
  );

  const isControlled = onChange !== null;

  const changeEvent = onChange || handleChange;

  return (
    <SelectField
      value={isControlled ? value : localValue}
      onChange={changeEvent}
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

      {options.map((option: Option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </SelectField>
  );
};

export const NativeSelect = ({
  value = null,
  onChange,
  options,
  placeholder = 'Please select',
  defaultValue = '',
  ...props
}: SelectProps) => {
  const [localValue, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    event => {
      setValue(event.target.value);
    },
    [setValue],
  );

  const isControlled = value !== null;

  const changeEvent = onChange || handleChange;

  return (
    <SelectField
      value={isControlled ? value : localValue}
      onChange={changeEvent}
      SelectProps={{
        native: true,
      }}
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option: Option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectField>
  );
};
