import React from 'react';
import styled from 'styled-components';
import { FormHelperText, Typography } from '@material-ui/core';
import { SurveyQuestionInputProps } from '../../types';
import { useSurveyForm } from '..';

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
`;

const ValueWrapper = styled.div`
  margin-top: 1rem;
  min-height: 1rem; // so that the space is reserved even when there is no value
`;

const Value = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};

  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: 1rem;
  }
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
