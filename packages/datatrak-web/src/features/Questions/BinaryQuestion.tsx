import React from 'react';

import { isNonEmptyArray } from '@tupaia/tsutils';
import { SurveyQuestionInputProps } from '../../types';
import { RadioQuestion } from './RadioQuestion';

export const BinaryQuestion = ({ options = [], ...props }: SurveyQuestionInputProps) => {
  const questionOptions = isNonEmptyArray(options)
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
  return <RadioQuestion {...props} options={questionOptions} />;
};
