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
  }
  .MuiSvgIcon-root {
    font-size: 1.25rem;
  }
`;

// Some options are returned as stringified JSON, so we need to parse them
const parseOption = (option: SurveyQuestionInputProps['options'][0]) => {
  try {
    const parsedOption = JSON.parse(option);
    if (!parsedOption.value) {
      // Valid JSON but not a valid option object, e.g. '50'
      throw new Error('Options defined as an object must contain the value key at minimum');
    }
    return parsedOption;
  } catch (e) {
    if (typeof option === 'string')
      return {
        label: option,
        value: option,
      };
    return option;
  }
};
export const RadioQuestion = ({
  id,
  label,
  name,
  inputRef,
  options = [],
}: SurveyQuestionInputProps) => {
  const formattedOptions = options.map(option => parseOption(option));
  return (
    <StyledRadioGroup
      id={id}
      label={label}
      name={name}
      inputRef={inputRef}
      options={formattedOptions}
      inputProps={{
        ['aria-describedby']: `question_number_${id}`,
      }}
    />
  );
};
