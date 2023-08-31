/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { FormControlLabel, TextField } from '@material-ui/core';
import { SurveyQuestionInputProps } from '../../types';
import styled from 'styled-components';

const Label = styled(FormControlLabel)`
  width: calc(100% - 3.5rem);
  align-items: flex-start;
  margin: 0;
  .MuiInput-root {
    font-size: 0.875rem;
  }
`;

enum FIELD_TYPES {
  FreeText = 'text',
  Number = 'number',
}

export const TextQuestion = ({
  id,
  label,
  name,
  inputRef,
  type,
  controllerProps,
}: SurveyQuestionInputProps) => {
  return (
    <Label
      label={label}
      name={name!}
      labelPlacement={'top'}
      inputRef={inputRef}
      {...controllerProps}
      control={
        <TextField
          id={id}
          aria-describedby={`question_number_${id}`}
          type={FIELD_TYPES[type as FIELD_TYPES]}
          placeholder="Enter your answer here"
          fullWidth
        />
      }
    />
  );
};
