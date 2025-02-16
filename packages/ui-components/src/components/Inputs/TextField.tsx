import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import { Property } from 'csstype';
import React from 'react';
import styled from 'styled-components';

import { InputLabel } from './InputLabel';

const ADORNMENT_COLOUR = '#c4c4c7';

const StyledTextField = styled(MuiTextField)<{ $focusColor?: Property.Color }>`
  margin-block-end: 1.2rem;
  cursor: auto;

  .MuiInputBase-root {
    background: ${props => props.theme.palette.common.white};
  }

  // The actual input field
  .MuiInputBase-input {
    color: ${props => props.theme.palette.text.primary};
    font-weight: 400;
    border-radius: 0.1875rem;
  }

  // helper text
  .MuiFormHelperText-root {
    margin-left: 0;
  }

  // The border
  .MuiOutlinedInput-notchedOutline,
  .MuiOutlinedInput-root:is(:hover, .Mui-disabled, .Mui-focused, .Mui-focusVisible)
    .MuiOutlinedInput-notchedOutline {
    border-color: ${props => props.theme.palette.grey['400']};
    border-width: max(0.0625rem, 1px);
    inset-block-start: 0;

    legend {
      display: none;
    }
  }

  // disabled
  .MuiInputBase-input.Mui-disabled {
    color: ${props => props.theme.palette.text.secondary};
    background-color: ${props => props.theme.palette.grey['100']};
  }

  // Focused state
  .MuiOutlinedInput-root:is(.Mui-focused, .Mui-focusVisible) .MuiOutlinedInput-notchedOutline {
    border-color: ${({ $focusColor, theme }) => $focusColor ?? theme.palette.primary.main};
  }

  .MuiFormLabel-root.Mui-focused {
    color: ${props => props.theme.palette.text.primary};
  }

  // The label
  .MuiFormLabel-root {
    position: relative;
    margin-block-end: 0.1875rem;
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

  .MuiInputBase-input::placeholder {
    color: ${props => props.theme.palette.grey[400]};
  }

  /* Override MaterialUI which hides the placeholder due to conflict with its floating labels */
  &&&& .MuiInputBase-input::placeholder {
    opacity: 55% !important;
  }

  // disable MaterialUI underline
  .MuiInput-underline::before,
  .MuiInput-underline::after {
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
  focusColor,
  label = '',
  tooltip,
  error,
  required,
  ...props
}: Partial<TextFieldProps> & {
  focusColor?: Property.Color;
  tooltip?: string;
}) => (
  <StyledTextField
    $focusColor={focusColor}
    fullWidth
    {...props}
    variant="outlined"
    error={error}
    required={required}
    label={
      label ? (
        <InputLabel
          label={label}
          tooltip={tooltip}
          as="span"
          labelProps={{
            required,
            error,
          }}
        />
      ) : null
    }
  />
);
