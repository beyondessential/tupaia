/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import styled from 'styled-components';
import { InputLabel } from './InputLabel';

const FOCUS_COLOUR = '#99d6ff';
const ADORNMENT_COLOUR = '#c4c4c7';

const StyledTextField = styled(MuiTextField)<TextFieldProps>`
  margin-bottom: 1.2rem;
  cursor: auto;

  .MuiInputBase-root {
    background: ${props => props.theme.palette.common.white};
  }

  // The actual input field
  .MuiInputBase-input {
    color: ${props => props.theme.palette.text.primary};
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.2rem;
    padding: 1rem;
    border-radius: 3px;
  }

  .MuiSelect-root {
    color: ${props => props.theme.palette.text.tertiary};
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

  // disabled
  .MuiInputBase-input.Mui-disabled {
    color: ${props => props.theme.palette.text.secondary};
    background-color: ${props => props.theme.palette.grey['100']};
  }

  .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline {
    border-color: ${props => props.theme.palette.grey['400']};
  }

  // Hover state
  .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
    border-color: ${props => props.theme.palette.grey['400']};
  }

  // Focused state
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-width: 1px;
    border-color: ${FOCUS_COLOUR};
    box-shadow: 0 0 5px rgba(0, 135, 216, 0.75);
  }

  .MuiFormLabel-root.Mui-focused {
    color: ${props => props.theme.palette.text.primary};
  }

  // The label
  .MuiFormLabel-root {
    position: relative;
    margin-bottom: 3px;
    color: ${props => props.theme.palette.text.secondary};
    font-size: 0.9375rem;
    line-height: 1.125rem;
    transform: none;
    display: flex;
  }

  // Adornments
  .MuiInputAdornment-root {
    color: ${ADORNMENT_COLOUR};
  }

  .MuiInputAdornment-positionStart {
    margin-right: 0;
    .MuiTypography-body1 {
      padding-left: 0.5rem;
    }
  }

  .MuiInputBase-inputAdornedStart,
  .MuiInputBase-adornedStart {
    padding-left: 5px;
  }

  /* Override MaterialUI which hides the placeholder due to conflict with its floating labels */
  &&&& {
    .MuiInputBase-input::placeholder {
      opacity: 1 !important;
      color: ${props => props.theme.palette.text.secondary};
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

export const TextField = ({
  label = '',
  tooltip,
  ...props
}: TextFieldProps & {
  tooltip?: string;
}) => (
  <StyledTextField
    fullWidth
    {...props}
    variant="outlined"
    label={label ? <InputLabel label={label} tooltip={tooltip} as="span" /> : null}
  />
);
