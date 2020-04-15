/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import MuiMenuItem from '@material-ui/core/MenuItem';
import { KeyboardArrowDown } from '@material-ui/icons';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from './TextField';
import * as COLORS from '../../theme/colors';

const SelectField = styled(({ SelectProps, ...props }) => (
  <TextField
    SelectProps={{
      IconComponent: iconProps => <KeyboardArrowDown {...iconProps} />,
      ...SelectProps,
    }}
    {...props}
    select
  />
))`
  svg {
    color: ${COLORS.GREY_72};
    font-size: 28px;
    top: calc(50% - 14px);
    right: 16px;
  }

  .MuiSelect-root {
    &:before {
      position: absolute;
      right: 55px;
      top: calc(50% - 15px);
      border-left: 1px solid ${COLORS.GREY_9F};
      height: 30px;
      content: '';
    }
  }
`;

/**
 * Select field
 */
export const Select = ({ options, placeholder, defaultValue, ...props }) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    event => {
      setValue(event.target.value);
    },
    [setValue],
  );

  return (
    <SelectField
      value={value}
      onChange={handleChange}
      SelectProps={{
        displayEmpty: true,
      }}
      {...props}
    >
      <MuiMenuItem value="" disabled>
        {placeholder}
      </MuiMenuItem>
      {options.map(option => (
        <MuiMenuItem key={option.value} value={option.value}>
          {option.label}
        </MuiMenuItem>
      ))}
    </SelectField>
  );
};

Select.propTypes = {
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.any,
};

Select.defaultProps = {
  placeholder: 'Please select',
  defaultValue: '',
};

/**
 * Native Select field
 */
export const NativeSelect = ({ options, placeholder, defaultValue, ...props }) => {
  const [value, setValue] = useState('');

  const handleChange = useCallback(
    event => {
      setValue(event.target.value);
    },
    [setValue],
  );

  return (
    <SelectField
      value={value}
      onChange={handleChange}
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
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.any,
};

NativeSelect.defaultProps = {
  placeholder: 'Please select',
  defaultValue: '',
};
