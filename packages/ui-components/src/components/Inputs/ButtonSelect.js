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

    &:focus {
      background: none;
    }
  }

  .MuiInputBase-input {
    color: ${props => props.theme.palette.text.primary};
    padding-top: 1.375rem;
    padding-bottom: 1.375rem;
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

export const ButtonSelect = ({
  id,
  label,
  options,
  labelKey,
  valueKey,
  index,
  onChange,
  disabled,
  muiProps,
}) => {
  const value = options[index][valueKey];

  const handlePrev = useCallback(() => {
    const newIndex = value === '' || index === 0 ? options.length - 1 : index - 1;
    onChange(newIndex);
  }, [options, onChange, index]);

  const handleNext = useCallback(() => {
    const newIndex = value === '' || index === options.length - 1 ? 0 : index + 1;
    onChange(newIndex);
  }, [options, onChange, index]);

  const handleChange = useCallback(
    event => {
      const newValue = event.target.value;
      const newIndex = options.findIndex(option => option[valueKey] === newValue);
      onChange(newIndex);
    },
    [onChange, options],
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
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  labelKey: PropTypes.string,
  valueKey: PropTypes.string,
  muiProps: PropTypes.object,
};

ButtonSelect.defaultProps = {
  label: null,
  labelKey: 'name',
  valueKey: 'id',
  disabled: false,
  muiProps: undefined,
};
