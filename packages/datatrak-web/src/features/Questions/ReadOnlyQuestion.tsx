import { FormHelperText, Typography } from '@material-ui/core';
import React from 'react';
import styled, { css } from 'styled-components';

import { useSurveyForm } from '..';
import { SurveyQuestionInputProps } from '../../types';

const Wrapper = styled.div`
  align-items: flex-start;
  border-block: max(0.0625rem, 1px) solid ${({ theme }) => theme.palette.divider};
  display: flex; // to get the label to not be full width, so that the tooltip only applies over the label text
  flex-direction: column;
  inline-size: 100%;
  justify-content: center;
  padding-block: 1.8rem 0.8rem;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding-block: 1rem;
  }
`;

const Label = styled(Typography).attrs({
  variant: 'h4',
})`
  font-size: 1rem;

  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      font-size: 0.875rem;
      font-weight: ${theme.typography.fontWeightMedium};
    }
  `}
`;

const InputHelperText = styled(FormHelperText)`
  font-size: 0.875rem;
`;

const ValueWrapper = styled.div`
  margin-top: 1rem;
  min-block-size: 1rem; // so that the space is reserved even when there is no value
`;

const Value = styled(Typography)`
  ${({ theme }) => css`
    font-weight: ${theme.typography.fontWeightMedium};

    ${theme.breakpoints.down('sm')} {
      font-size: 1rem;
    }
  `}
`;

interface ReadOnlyQuestionInputProps extends SurveyQuestionInputProps {
  className?: string;
}

export const ReadOnlyQuestion = ({
  label,
  name,
  detailLabel,
  className,
}: ReadOnlyQuestionInputProps) => {
  const { formData } = useSurveyForm();
  const value = formData[name!];
  return (
    <Wrapper className={className}>
      <Label>{label}</Label>
      {detailLabel && <InputHelperText>{detailLabel}</InputHelperText>}
      <ValueWrapper>
        <Value>{value}</Value>
      </ValueWrapper>
    </Wrapper>
  );
};

export const CodeGeneratorQuestion = styled(ReadOnlyQuestion)`
  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding-top: 0;
    border-width: 0 0 1px;
  }
`;
