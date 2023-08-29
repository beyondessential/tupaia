/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SurveyQuestionInputProps } from '../../types';

const InstructionHeading = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1.125rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;
export const InstructionQuestion = ({ text, detailLabel }: SurveyQuestionInputProps) => {
  if (!text && !detailLabel) {
    return null;
  }
  return (
    <>
      {text && <InstructionHeading>{text}</InstructionHeading>}
      {detailLabel && <Typography>{detailLabel}</Typography>}
    </>
  );
};
