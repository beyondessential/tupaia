/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { lighten } from '@material-ui/core';
import { RadioGroup } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';

const StyledRadioGroup = styled(RadioGroup)`
  width: 100%;
  max-width: 25rem;
  margin-bottom: 0;
  legend {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 1rem;
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  .MuiFormGroup-root {
    display: flex;
    flex-direction: column;
    border: none;
  }
  .MuiRadio-root {
    color: ${({ theme }) => theme.palette.text.primary};
    &.Mui-checked {
      color: ${({ theme }) => theme.palette.primary.main};
    }
  }
  .MuiFormControlLabel-root {
    border: 1px solid ${({ theme }) => theme.palette.text.primary};
    border-radius: 4px;

    &:has(.Mui-checked) {
      border-color: ${({ theme }) => theme.palette.primary.main};
      background-color: ${({ theme }) => lighten(theme.palette.primary.main, 0.9)};
    }
    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
    &:last-child {
      border-right: 1px solid ${({ theme }) => theme.palette.text.primary}; // overwrite styles that remove this
    }
    .MuiFormControlLabel-label {
      font-size: 0.875rem;
    }
    &:has([aria-invalid='true']) {
      border-color: ${({ theme }) => theme.palette.error.main};
      .MuiSvgIcon-root {
        color: ${({ theme }) => theme.palette.error.main};
      }
    }
  }
  .MuiSvgIcon-root {
    font-size: 1.25rem;
  }
`;

export const RadioQuestion = ({
  id,
  label,
  name,
  options,
  required,
  controllerProps: { onChange, value, ref, invalid },
}: SurveyQuestionInputProps) => {
  // This is a controlled component because value and onChange are required props
  return (
    <StyledRadioGroup
      onChange={onChange}
      id={id}
      label={label}
      name={name!}
      inputRef={ref}
      options={options || []}
      value={value || ''}
      required={required}
      inputProps={{
        ['aria-describedby']: `question_number_${id}`,
        ['aria-invalid']: invalid,
      }}
    />
  );
};
