/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
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
import { AddBoxOutlined } from '@material-ui/icons';
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
export const Autocomplete = ({ label, options, ...props }) => {
  return (
    <MuiAutocomplete
      options={options}
      getOptionLabel={option => option.title}
      popupIcon={<KeyboardArrowDown />}
      PaperComponent={StyledPaper}
      renderInput={params => <TextField {...params} label={label} />}
      {...props}
    />
  );
};

Autocomplete.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
};

/*
 * Fancy Autocomplete
 */
const ChevronLeft = styled(MuiChevronLeft)`
  color: ${COLORS.GREY_72};
`;

const ChevronRight = styled(MuiChevronRight)`
  color: ${COLORS.GREY_72};
`;

const FancyInput = ({ InputProps, handlePrev, handleNext, ...props }) => {
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

const Menu = styled(MuiMenu)`
  color: ${COLORS.GREY_72};
`;

const StyledAutoComplete = styled(MuiAutocomplete)`
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

export const FancyAutocomplete = ({ label, options, ...props }) => {
  const [value, setValue] = useState(null);

  const indexedOptions = options.map((option, index) => ({ ...option, index }));

  const handlePrev = event => {
    if (value === null) {
      const newValue = indexedOptions[indexedOptions.length - 1];
      setValue(newValue);
    } else if (value.index > 0) {
      const newValue = indexedOptions[value.index - 1];
      setValue(newValue);
    }
  };

  const handleNext = event => {
    if (value === null) {
      const newValue = indexedOptions[0];
      setValue(newValue);
    } else if (value.index < indexedOptions.length - 1) {
      const newValue = indexedOptions[value.index + 1];
      setValue(newValue);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <StyledAutoComplete
      value={value}
      onChange={handleChange}
      options={indexedOptions}
      getOptionLabel={option => option.title}
      popupIcon={<Menu />}
      PaperComponent={StyledPaper}
      renderInput={params => (
        <FancyInput {...params} label={label} handlePrev={handlePrev} handleNext={handleNext} />
      )}
      {...props}
    />
  );
};

FancyAutocomplete.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
};
