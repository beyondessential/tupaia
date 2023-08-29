/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { DatePicker as BaseDatePicker } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';
import { useFormContext, Controller } from 'react-hook-form';
import styled from 'styled-components';
import { TextField } from '@material-ui/core';

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
  }
  label + .MuiInput-formControl {
    margin-top: 1.2rem;
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

export const DateQuestion = ({ name, label, id }: SurveyQuestionInputProps) => {
  const { control } = useFormContext();
  // mui datepicker doesn't like uncontroller inputs, so a workaround for this is to use a controller from react-hook-form (https://react-hook-form.com/get-started#IntegratingwithUIlibraries)
  return (
    <Controller
      name={name}
      control={control}
      render={renderProps => {
        return <DatePicker {...renderProps} inputRef={renderProps.ref} label={label} id={id} />;
      }}
    />
  );
};
