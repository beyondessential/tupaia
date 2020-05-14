/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect, useCallback } from 'react';
import MuiMenu from '@material-ui/icons/Menu';
import MuiChevronRight from '@material-ui/icons/ChevronRight';
import MuiChevronLeft from '@material-ui/icons/ChevronLeft';
import MuiInputAdornment from '@material-ui/core/InputAdornment';
import MuiMenuItem from '@material-ui/core/MenuItem';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TextField } from './TextField';
import { IconButton } from '../IconButton';

const ChevronLeft = styled(MuiChevronLeft)`
  color: ${props => props.theme.palette.text.tertiary};
`;

const ChevronRight = styled(MuiChevronRight)`
  color: ${props => props.theme.palette.text.tertiary};
`;

const boxShadow = '0 0 6px rgba(0, 0, 0, 0.15)';

const StyledTextField = styled(TextField)`
  .MuiSelect-root {
    padding-left: 3.5rem;
  }

  .MuiInputBase-input {
    color: ${props => props.theme.palette.text.primary};
  }

  .MuiOutlinedInput-notchedOutline {
    box-shadow: ${boxShadow};
  }

  .MuiInputAdornment-positionEnd {
    position: absolute;
    right: 0;
    height: 100%;
    max-height: 100%;

    &:before {
      content: none;
    }
  }

  .MuiOutlinedInput-adornedEnd {
    padding-right: 0;
  }

  /*
  * Menu styles
  */
  .MuiMenu-paper {
    max-height: 20rem;
  }

  .MuiMenuItem-root {
    padding: 0.6rem 1.25rem;
  }
`;

const Counter = styled.div`
  color: ${props => props.theme.palette.text.tertiary};
`;

const Menu = styled(MuiMenu)`
  color: ${props => props.theme.palette.text.tertiary};
  font-size: 1.5rem;
  top: calc(50% - 0.75rem);
  left: 1.2rem;
`;

/**
 * Button Select Field
 */
export const ButtonSelect = ({
  id,
  label,
  options,
  labelKey,
  valueKey,
  controlValue,
  onChange,
  defaultValue,
  disabled,
  muiProps,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [index, setIndex] = useState(null);

  /*
   * Set the first value as default if no default is set
   */
  useEffect(() => {
    if (!defaultValue) {
      setValue(options[0][valueKey]);
    }
  }, [defaultValue]);

  /*
   * Set internal value based on parent control value
   */
  useEffect(() => {
    if (controlValue) {
      setValue(controlValue);
    }
  }, [controlValue]);

  /*
   * Call on Change handler when value changes
   */
  useEffect(() => {
    if (onChange) {
      onChange(value);
    }
  }, [value]);

  /*
   * Set index based on value
   */
  useEffect(() => {
    const newIndex = options.findIndex(option => option[valueKey] === value);
    setIndex(newIndex);
  }, [value]);

  const handlePrev = useCallback(() => {
    const newIndex = value === '' || index === 0 ? options.length - 1 : index - 1;
    const newValue = options[newIndex];
    setValue(newValue[valueKey]);
  }, [setValue, value, index, options]);

  const handleNext = useCallback(() => {
    const newIndex = value === '' || index === options.length - 1 ? 0 : index + 1;
    const newValue = options[newIndex];
    setValue(newValue[valueKey]);
  }, [setValue, value, index, options]);

  const handleChange = useCallback(
    event => {
      const newValue = event.target.value;
      setValue(newValue);
    },
    [setValue],
  );

  return (
    <StyledTextField
      id={id}
      label={label}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      SelectProps={{
        displayEmpty: true,
        IconComponent: iconProps => <Menu {...iconProps} />,
        MenuProps: {
          disablePortal: true,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          getContentAnchorEl: null,
          PaperProps: {
            elevation: 0,
            variant: 'outlined',
          },
        },
      }}
      InputProps={{
        endAdornment: (
          <MuiInputAdornment position="end">
            <IconButton onClick={handlePrev}>
              <ChevronLeft />
            </IconButton>
            <Counter>
              {index + 1}/{options.length}
            </Counter>
            <IconButton onClick={handleNext}>
              <ChevronRight />
            </IconButton>
          </MuiInputAdornment>
        ),
      }}
      select
      {...muiProps}
    >
      {options.map(option => (
        <MuiMenuItem key={option[valueKey]} value={option[valueKey]}>
          {option[labelKey]}
        </MuiMenuItem>
      ))}
    </StyledTextField>
  );
};

ButtonSelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  controlValue: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.any,
  disabled: PropTypes.bool,
  labelKey: PropTypes.string,
  valueKey: PropTypes.string,
  muiProps: PropTypes.object,
};

ButtonSelect.defaultProps = {
  defaultValue: '',
  labelKey: 'name',
  valueKey: 'id',
  controlValue: undefined,
  onChange: undefined,
  disabled: false,
  muiProps: undefined,
};
