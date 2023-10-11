/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { SurveyQuestionInputProps } from '../../types';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Tooltip } from '@tupaia/ui-components';
import { QuestionType } from '@tupaia/types';
import { useSurveyForm } from '..';
import { getArithmeticDisplayAnswer } from '../Survey';
import { QuestionHelperText } from './QuestionHelperText';

const Wrapper = styled.div`
  width: 100%;
  padding: 0.8rem 0;
  border-width: 1px 0;
  border-style: solid;
  border-color: ${({ theme }) => theme.palette.divider};
  display: flex; // to get the label to not be full width, so that the tooltip only applies over the label text
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`;

const Label = styled(Typography).attrs({
  variant: 'h4',
})`
  font-size: 1rem;
  cursor: pointer;
`;

const ValueWrapper = styled.div`
  margin-top: 1rem;
  min-height: 2rem; // so that the space is reserved even when there is no value
`;
const Value = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
`;

export const ReadOnlyQuestion = ({
  label,
  name,
  detailLabel,
  config,
  type,
}: SurveyQuestionInputProps) => {
  const { formData } = useSurveyForm();
  const value = formData[name!];
  const displayValue =
    type === QuestionType.Arithmetic ? getArithmeticDisplayAnswer(config, value, formData) : value;
  return (
    <Wrapper>
      <Tooltip title="Complete questions above to calculate" enterDelay={1000}>
        <Label>{label}</Label>
      </Tooltip>
      {detailLabel && <QuestionHelperText>{detailLabel}</QuestionHelperText>}
      <ValueWrapper>
        <Value>{displayValue}</Value>
      </ValueWrapper>
    </Wrapper>
  );
};
