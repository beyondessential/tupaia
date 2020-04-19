/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import MuiAutocomplete from '@material-ui/lab/Autocomplete';
import MuiPaper from '@material-ui/core/Paper';
import MuiKeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import MuiMenu from '@material-ui/icons/Menu';
import MuiChevronRight from '@material-ui/icons/ChevronRight';
import MuiChevronLeft from '@material-ui/icons/ChevronLeft';
import InputAdornment from '@material-ui/core/InputAdornment';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import * as COLORS from '../../theme/colors';
import { TextField } from './TextField';
import { IconButton } from '../IconButton';

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

/*
 * NavAutocomplete components
 */
const ChevronLeft = styled(MuiChevronLeft)`
  color: ${COLORS.GREY_72};
`;

const ChevronRight = styled(MuiChevronRight)`
  color: ${COLORS.GREY_72};
`;

const NavInput = ({ InputProps, handlePrev, handleNext, ...props }) => {
  /* Extract the Mui icon buttons for  re-use in different part of the input */
  const Cross = () => InputProps.endAdornment.props.children[0];
  const Menu = () => InputProps.endAdornment.props.children[1];

  return (
    <TextField
      InputProps={{
        ...InputProps,
        startAdornment: (
          <InputAdornment position="start">
            <Menu />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Cross />
            <IconButton onClick={handlePrev}>
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={handleNext}>
              <ChevronRight />
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

NavInput.propTypes = {
  InputProps: PropTypes.object.isRequired,
  handlePrev: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
};

const Menu = styled(MuiMenu)`
  color: ${COLORS.GREY_72};
`;

const StyledAutoComplete = styled(Autocomplete)`
  /*
  * Adornments
  */
  .MuiInputAdornment-positionEnd {
    position: absolute;
    right: 5px;
    color: ${COLORS.GREY_72};

    .MuiSvgIcon-root {
      font-size: 20px;
    }

    &:before {
      position: absolute;
      right: 28px;
      content: '';
      border-left: 1px solid ${COLORS.GREY_DE};
      height: 30px;
    }
  }

  .MuiOutlinedInput-adornedEnd {
    padding-right: 18px;
  }
`;

/*
 * NavAutocomplete
 */
export const NavAutocomplete = ({ options, onChange, ...props }) => {
  const [value, setValue] = useState(null);

  const indexedOptions = options.map((option, index) => ({ ...option, index }));

  const handlePrev = useCallback(() => {
    if (value === null) {
      const newValue = indexedOptions[indexedOptions.length - 1];
      setValue(newValue);
    } else if (value.index > 0) {
      const newValue = indexedOptions[value.index - 1];
      setValue(newValue);
    }
  }, [setValue, indexedOptions]);

  const handleNext = useCallback(() => {
    if (value === null) {
      const newValue = indexedOptions[0];
      setValue(newValue);
    } else if (value.index < indexedOptions.length - 1) {
      const newValue = indexedOptions[value.index + 1];
      setValue(newValue);
    }
  }, [setValue, indexedOptions]);

  const handleChange = useCallback(
    (event, newValue) => {
      setValue(newValue);

      if (typeof onChange === 'function') {
        onChange(event, newValue);
      }
    },
    [setValue, onChange],
  );

  return (
    <StyledAutoComplete
      value={value}
      onChange={handleChange}
      options={indexedOptions}
      popupIcon={<Menu />}
      renderInput={params => (
        <NavInput
          {...params}
          label={props.label}
          placeholder={props.placeholder}
          handlePrev={handlePrev}
          handleNext={handleNext}
        />
      )}
      {...props}
    />
  );
};

NavAutocomplete.propTypes = {
  options: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

NavAutocomplete.defaultProps = {
  onChange: null,
  placeholder: '',
};
