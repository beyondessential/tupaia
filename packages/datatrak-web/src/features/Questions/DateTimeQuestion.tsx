import React from 'react';
import styled from 'styled-components';
import { TextField } from '@material-ui/core';
import { DateTimePicker as BaseDateTimePicker } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';

const DateTimePicker = styled(BaseDateTimePicker).attrs({
  InputAdornmentProps: {
    position: 'end',
  },
  fullWidth: false,
  TextFieldComponent: TextField,
})`
  .MuiFormLabel-root {
    transform: none;
    color: ${props => props.theme.palette.text.primary};
    position: static;
    line-height: 1.5;
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

export const DateTimeQuestion = ({
  label,
  id,
  required,
  detailLabel,
  controllerProps: { value, onChange, name, ref, invalid },
}: SurveyQuestionInputProps) => {
  return (
    <DateTimePicker
      value={value}
      onChange={onChange}
      label={label}
      id={id}
      name={name}
      inputRef={ref}
      error={invalid}
      required={required}
      helperText={detailLabel}
      format="P p" // locale date time format
    />
  );
};
