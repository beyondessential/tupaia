import React from 'react';
import { Tooltip } from '@tupaia/ui-components';
import styled from 'styled-components';
import { FormHelperText, Typography } from '@material-ui/core';
import { getArithmeticDisplayAnswer, useSurveyForm } from '../Survey';
import { SurveyQuestionInputProps } from '../../types';

const Wrapper = styled.div`
  width: 100%;
  padding: 1.8rem 0 0.8rem;
  border-width: 1px 0;
  border-style: solid;
  border-color: ${({ theme }) => theme.palette.divider};
  display: flex; // to get the label to not be full width, so that the tooltip only applies over the label text
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding: 1rem 0;
  }
`;

const Label = styled(Typography).attrs({
  variant: 'h4',
})`
  font-size: 1rem;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 0.875rem;
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
`;

const InputHelperText = styled(FormHelperText)`
  font-size: 0.875rem;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 0.75rem;
  }
`;

const ValueWrapper = styled.div`
  margin-top: 1rem;
  min-height: 1rem; // so that the space is reserved even when there is no value

  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-top: 0.5rem;
  }
`;

const Value = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};

  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 1rem;
  }
`;

export const ArithmeticQuestion = ({
  label,
  name,
  detailLabel,
  config,
}: SurveyQuestionInputProps) => {
  const { formData } = useSurveyForm();
  const value = formData[name!];
  const displayValue = getArithmeticDisplayAnswer(config, value, formData);
  return (
    <Wrapper>
      <Tooltip title="Complete questions above to calculate" enterDelay={1000}>
        <Label>{label}</Label>
      </Tooltip>
      {detailLabel && <InputHelperText>{detailLabel}</InputHelperText>}
      <ValueWrapper>
        <Value>{displayValue}</Value>
      </ValueWrapper>
    </Wrapper>
  );
};
