/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { Ref } from 'react';
import { FormControlLabel, TextField } from '@material-ui/core';
import { SurveyQuestionFieldProps } from '../../types';
import styled from 'styled-components';

const Label = styled(FormControlLabel)`
  width: 100%;
  align-items: flex-start;
  margin: 0;
  .MuiInput-root {
    font-size: 0.875rem;
  }
`;

interface TextQuestionProps extends SurveyQuestionFieldProps {
  inputRef: Ref<HTMLInputElement>;
}

enum FIELD_TYPES {
  FreeText = 'text',
  Number = 'number',
}

export const TextQuestion = ({ id, label, name, inputRef, type }: TextQuestionProps) => {
  return (
    <Label
      label={label}
      name={name}
      labelPlacement={'top'}
      inputRef={inputRef}
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
