import React from 'react';
import { Typography } from '@material-ui/core';
import { SurveyQuestionInputProps } from '../../types';
import { InputHelperText } from '../../components';

export const InstructionQuestion = ({ text, detailLabel }: SurveyQuestionInputProps) => {
  if (!text && !detailLabel) {
    return null;
  }
  return (
    <div>
      {text && <Typography variant="h3">{text}</Typography>}
      {detailLabel && <InputHelperText>{detailLabel}</InputHelperText>}
    </div>
  );
};
