/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { SurveyQuestionInputProps } from '../../types';
import { RadioQuestion } from '.';

export const BinaryQuestion = ({
  id,
  label,
  name,
  inputRef,
  options = [],
}: SurveyQuestionInputProps) => {
  const questionOptions = options?.length
    ? options
    : [
        {
          value: 'Yes',
          label: 'Yes',
        },
        {
          value: 'No',
          label: 'No',
        },
      ];
  return (
    <RadioQuestion
      id={id}
      label={label}
      name={name}
      inputRef={inputRef}
      options={questionOptions}
    />
  );
};
