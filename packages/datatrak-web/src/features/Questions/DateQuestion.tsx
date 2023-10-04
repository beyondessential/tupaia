/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { TextField } from '@material-ui/core';
import { DatePicker as BaseDatePicker } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';

const DatePicker = styled(BaseDatePicker).attrs({
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
`;

export const DateQuestion = ({
  label,
  id,
  required,
  controllerProps: { onChange, value, name, ref, invalid },
}: SurveyQuestionInputProps) => {
  return (
    <DatePicker
      onChange={onChange}
      value={value}
      label={label}
      id={id}
      name={name}
      inputRef={ref}
      error={invalid}
      required={required}
    />
  );
};
