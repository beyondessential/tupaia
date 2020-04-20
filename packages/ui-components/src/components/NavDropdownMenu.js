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
import * as COLORS from '../theme/colors';
import { TextField } from './Inputs';
import { IconButton } from './IconButton';

const ChevronLeft = styled(MuiChevronLeft)`
  color: ${COLORS.TEXT_LIGHTGREY};
`;

const ChevronRight = styled(MuiChevronRight)`
  color: ${COLORS.TEXT_LIGHTGREY};
`;

const boxShadow = '0 0 6px rgba(0, 0, 0, 0.15)';

const StyledTextField = styled(TextField)`
  .MuiSelect-root {
    padding-left: 3.5rem;
  }

  .MuiInputBase-input {
    color: ${COLORS.TEXT_DARKGREY};
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
  color: ${COLORS.TEXT_LIGHTGREY};
`;

const Menu = styled(MuiMenu)`
  color: ${COLORS.TEXT_LIGHTGREY};
  font-size: 1.5rem;
  top: calc(50% - 0.75rem);
  left: 1.2rem;
`;

/**
 * Select field
 */
export const NavSelect = ({ options, placeholder, defaultValue, onChange, ...props }) => {
  const [value, setValue] = useState(defaultValue);
  const [index, setIndex] = useState(null);

  useEffect(() => {
    setValue(options[0].id);
  }, []);

  useEffect(() => {
    const newIndex = options.findIndex(option => option.id === value);
    setIndex(newIndex);

    if (typeof onChange === 'function') {
      onChange(options[newIndex]);
    }
  }, [value]);

  const handlePrev = () => {
    const newIndex = value === '' || index === 0 ? options.length - 1 : index - 1;
    const newValue = options[newIndex];
    setValue(newValue.id);
  };

  const handleNext = () => {
    const newIndex = value === '' || index === options.length - 1 ? 0 : index + 1;
    const newValue = options[newIndex];
    setValue(newValue.id);
  };

  const handleChange = useCallback(
    event => {
      const newValue = event.target.value;
      setValue(newValue);
    },
    [setValue, onChange],
  );

  return (
    <StyledTextField
      value={value}
      onChange={handleChange}
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
      {...props}
      select
    >
      {options.map(option => (
        <MuiMenuItem key={option.id} value={option.id}>
          {option.name}
        </MuiMenuItem>
      ))}
    </StyledTextField>
  );
};

NavSelect.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
};

NavSelect.defaultProps = {
  placeholder: 'Please select',
  defaultValue: '',
  onChange: null,
};
