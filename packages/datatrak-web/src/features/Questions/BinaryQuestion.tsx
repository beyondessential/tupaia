import React from 'react';
import { SurveyQuestionInputProps } from '../../types';
import { RadioQuestion } from './RadioQuestion';

export const BinaryQuestion = ({ options = [], ...props }: SurveyQuestionInputProps) => {
  const questionOptions = Array.isArray(options)
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
