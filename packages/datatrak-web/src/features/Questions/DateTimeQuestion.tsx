/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

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
`;

export const DateTimeQuestion = ({
  name,
  label,
  id,
  controllerProps,
}: SurveyQuestionInputProps) => {
  return (
    <DateTimePicker
      {...controllerProps}
      inputRef={controllerProps.ref}
      label={label}
      id={id}
      name={name}
    />
  );
};
