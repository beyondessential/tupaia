/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiTextField from '@material-ui/core/TextField';
import styled from 'styled-components';

const TEXT_FIELD_FONT_FAMILY = "'Inter', sans-serif";

const BaseTextField = props => <MuiTextField fullWidth {...props} variant="outlined" />;

const focusColor = '#99d6ff';
const adornmentColor = '#c4c4c7';

export const TextField = styled(BaseTextField)`
  margin-bottom: 1.2rem;

  .MuiInputBase-root {
    background: ${props => props.theme.palette.common.white};
  }

  // The actual input field
  .MuiInputBase-input {
    font-family: ${TEXT_FIELD_FONT_FAMILY};
    color: ${props => props.theme.palette.text.primary};
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    padding: 15px 16px 16px;
    border-radius: 3px;
  }

  // Error state
  .MuiInputBase-root.Mui-error {
    background: ${props => props.theme.palette.error.light};
  }

  // helper text
  .MuiFormHelperText-root {
    margin-left: 0;
  }

  // The border
  .MuiOutlinedInput-notchedOutline {
    border-color: ${props => props.theme.palette.grey['400']};
    top: 0;

    legend {
      display: none;
    }
  }

  // Hover state
  .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: ${props => props.theme.palette.grey['400']};
  }

  // Focused state
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-width: 1px;
    border-color: ${focusColor};
    box-shadow: 0 0 5px rgba(0, 135, 216, 0.75);
  }

  .MuiFormLabel-root.Mui-focused {
    color: ${props => props.theme.palette.text.primary};
  }

  // The label
  .MuiFormLabel-root {
    position: relative;
    margin-bottom: 4px;
    font-family: ${TEXT_FIELD_FONT_FAMILY};
    color: ${props => props.theme.palette.text.secondary};
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
    transform: none;
  }

  // Adornments
  .MuiInputAdornment-root {
    color: ${adornmentColor};
  }

  .MuiInputAdornment-positionStart {
    margin-right: 0;
  }

  .MuiInputBase-inputAdornedStart {
    padding-left: 5px;
  }

  /* Override MaterialUI which hides the placeholder due to conflict with its floating labels */
  &&&& {
    .MuiInputBase-input::placeholder {
      opacity: 1 !important;
      color: ${props => props.theme.palette.text.tertiary};
    }
  }

  // disable MaterialUI underline
  .MuiInput-underline:before,
  .MuiInput-underline:after {
    display: none;
  }

  //Textarea
  .MuiOutlinedInput-multiline {
    padding: 0;
  }

  // Small size
  .MuiInputBase-inputMarginDense {
    padding: 10px;
  }
`;
