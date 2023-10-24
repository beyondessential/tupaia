/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Typography } from '@material-ui/core';
import { SurveyQuestionInputProps } from '../../types';
import { QuestionHelperText } from './QuestionHelperText';

export const InstructionQuestion = ({ text, detailLabel }: SurveyQuestionInputProps) => {
  if (!text && !detailLabel) {
    return null;
  }
  return (
    <div>
      {text && <Typography variant="h3">{text}</Typography>}
      {detailLabel && <QuestionHelperText>{detailLabel}</QuestionHelperText>}
    </div>
  );
};
