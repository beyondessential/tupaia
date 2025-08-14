import React from 'react';
import styled from 'styled-components';
import { TextField } from '@material-ui/core';
import { DatePicker as BaseDatePicker } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';
import { InputHelperText } from '../../components';

const DatePicker = styled(BaseDatePicker).attrs({
  InputAdornmentProps: {
    position: 'end',
  },
  fullWidth: false,
  TextFieldComponent: TextField,
})`
  width: 100%;
  max-width: 25rem;
  .MuiFormLabel-root {
    transform: none;
    position: static;
  }
  label + .MuiInput-formControl {
    margin-top: 0.3rem;
    font-size: 0.875rem;
  }
  .MuiSvgIcon-root {
    width: 1rem;
    height: 1rem;
    fill: ${props => props.theme.palette.primary.main};
  }
  .MuiInputBase-input {
    color: ${props => props.theme.palette.text.primary};
  }
  .MuiInputBase-root {
    order: 2; // make the helper text appear above the input
  }
`;

export const DateQuestion = ({
  label,
  id,
  required,
  detailLabel,
  controllerProps: { onChange, value, name, ref, invalid },
}: SurveyQuestionInputProps) => {
  return (
    <DatePicker
      onChange={onChange}
      format="P" // locale date format
      value={value}
      label={label}
      id={id}
      name={name}
      inputRef={ref}
      error={invalid}
      required={required}
      helperText={detailLabel}
      FormHelperTextProps={{ component: InputHelperText }}
    />
  );
};
