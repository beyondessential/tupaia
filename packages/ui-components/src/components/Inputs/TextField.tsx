import React from 'react';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import styled from 'styled-components';
import { InputLabel } from './InputLabel';

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
    border-radius: 3px;
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
  }

  .MuiFormLabel-root.Mui-focused {
    color: ${props => props.theme.palette.text.primary};
  }

  // The label
  .MuiFormLabel-root {
    position: relative;
    margin-bottom: 3px;
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
      opacity: 0.4 !important;
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
  error,
  required,
  ...props
}: Partial<TextFieldProps> & {
  tooltip?: string;
}) => (
  <StyledTextField
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
